const ghost = require("https://github.com/PipedreamHQ/pipedream/components/ghost/ghost-admin.app.js");

module.exports = {
  name: "Page Published (Instant)",
  description: "Emits an event for each new page published on a site.",
  version: "0.0.1",
  props: {
    ghost,
    db: "$.service.db",
    http: "$.interface.http",
  },

  hooks: {
    async activate() {
      const data = {
        webhooks: [
          {
            event: "page.published",
            target_url: this.http.endpoint,
          },
        ],
      };
      const token = await this.ghost._getToken();
      const resp = await this.ghost.createHook(token, data);
      this.db.set("hookId", resp.data.webhooks[0].id);
      this.db.set("token", token);
    },
    async deactivate() {
      console.log(this.db.get("hookId"));
      await this.ghost.deleteHook(this.db.get("hookId"), this.db.get("token"));
    },
  },

  async run(event) {
    this.$emit(event.body, {
      id: event.body.page.current.id,
      summary: event.body.page.current.title,
      ts: Date.now(),
    });
  },
};