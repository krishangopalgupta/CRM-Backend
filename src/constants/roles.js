export const rolePermissions = {
  member: ["customer:create", "customer:read", "customer:update"],
  owner: [
    "customer:create",
    "customer:read",
    "customer:update",
    "customer:delete",
    "member:invite",
    "member:read"
  ],
};
