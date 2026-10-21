export const rolePermissions = {
  member: [
    "customer:create",
    "customer:read",
    "customer:update",
    "contact:create",
  ],
  owner: [
    "customer:create",
    "customer:read",
    "customer:update",
    "customer:delete",
    "customer:restore",
    "invitation:create",
    "invitation:read",
    "contact:create",
  ],
};
