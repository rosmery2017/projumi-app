export const getUserRoleId = (user) => {
  const rawRole =
    user?.fk_rol ??
    user?.fkRol ??
    user?.id_rol ??
    user?.idRol ??
    user?.rol?.id_rol ??
    user?.rol?.id ??
    user?.raw?.fk_rol ??
    null;

  const roleId = Number(rawRole);
  return Number.isFinite(roleId) ? roleId : null;
};

export const isClientUser = (user) => getUserRoleId(user) === 4;
export const isEntrepreneurUser = (user) => {
  const roleName = String(
    user?.rol?.rol ||
      user?.rol?.nombre ||
      user?.rol_nombre ||
      user?.tipo ||
      ''
  ).toLowerCase();

  return getUserRoleId(user) === 3 || roleName.includes('emprendedor');
};
