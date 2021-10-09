export const roles = <const>['viewer', 'contributor', 'editor', 'admin'];
export const recursiveRoles = <const>['owner', ...roles];
export type Role = (typeof roles)[number];
export type RecursiveRole = (typeof recursiveRoles)[number];
