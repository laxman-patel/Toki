export const authServiceFactory = () => ({
  getControlPlaneActor() {
    return {
      actorType: "user" as const,
      actorId: "control-plane-user"
    };
  },
  getWorkOsStatus() {
    return {
      configured: Boolean(process.env.WORKOS_API_KEY && process.env.WORKOS_CLIENT_ID),
      mode: "scaffold"
    };
  }
});
