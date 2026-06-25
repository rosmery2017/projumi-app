export const getDisplayName = (user) => {
  if (!user) {
    return 'Usuario';
  }

  const fullName = [user.nombre || user.name || user.first_name, user.apellido || user.last_name]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    fullName ||
    user.fullName ||
    user.nombreCompleto ||
    user.username ||
    user.email ||
    user.correo ||
    user.cedula ||
    'Usuario'
  );
};
