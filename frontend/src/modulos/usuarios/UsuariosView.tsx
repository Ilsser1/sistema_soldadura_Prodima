import React, { useState } from 'react';
import { Usuario, RolUsuario, EstadoUsuario } from '../../../../shared/types';
import { Users, UserPlus, Search, KeyRound, Shield, UserX, UserCheck, X, Edit2, CheckCircle2, Lock, Eye, Info } from 'lucide-react';

interface UsuariosViewProps {
  usuarios: Usuario[];
  onCrear: (u: Partial<Usuario>) => Promise<void>;
  onActualizar: (id: number, u: Partial<Usuario>) => Promise<void>;
  onToggleEstado: (id: number) => Promise<void>;
  currentRole: RolUsuario;
}

export const UsuariosView: React.FC<UsuariosViewProps> = ({
  usuarios,
  onCrear,
  onActualizar,
  onToggleEstado,
  currentRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    username: '',
    password: 'password123',
    rol: 'Técnico' as RolUsuario,
    estado: 'Activo' as EstadoUsuario
  });

  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  if (currentRole !== 'Administrador') {
    return (
      <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
        <Shield className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-200">Acceso Restringido</h3>
        <p className="text-xs mt-1 text-slate-400">
          La administración de usuarios del sistema es una función exclusiva del rol <span className="text-amber-400 font-bold">Administrador</span>.
        </p>
      </div>
    );
  }

  const filteredUsuarios = (usuarios || []).filter(u => {
    const matchesSearch =
      (u.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.apellido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.correo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'TODOS' || u.rol === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenModal = (user?: Usuario) => {
    setShowPassword(false);
    if (user) {
      setEditingUser(user);
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        username: user.username,
        password: '',
        rol: user.rol,
        estado: user.estado
      });
    } else {
      setEditingUser(null);
      setFormData({
        nombre: '',
        apellido: '',
        correo: '',
        username: '',
        password: 'password123',
        rol: 'Supervisor',
        estado: 'Activo'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      if (editingUser && !payload.password) {
        delete payload.password;
      }
      if (editingUser) {
        await onActualizar(editingUser.id, payload);
        setAlertMessage(`Usuario '${formData.username}' actualizado correctamente.`);
      } else {
        await onCrear(payload);
        setAlertMessage(`Usuario '${formData.username}' registrado correctamente con su rol asignado.`);
      }
      setIsModalOpen(false);
      setTimeout(() => setAlertMessage(null), 4000);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleResetPass = async (id: number, username: string) => {
    const newPass = prompt(`Ingresa la nueva contraseña para '${username}':`, 'Prodima2026!');
    if (newPass) {
      await onActualizar(id, { password: newPass });
      setAlertMessage(`Contraseña de '${username}' actualizada exitosamente a: ${newPass}`);
      setTimeout(() => setAlertMessage(null), 6000);
    }
  };

  return (
    <div className="space-y-6">
      
      {alertMessage && (
        <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{alertMessage}</span>
          </div>
          <button onClick={() => setAlertMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Control de Usuarios y Roles de Acceso
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de credenciales para ingresar al sistema según los roles: <span className="text-purple-400 font-semibold">Administrador</span>, <span className="text-cyan-400 font-semibold">Supervisor</span> y <span className="text-amber-400 font-semibold">Técnico</span>.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-amber-500/10"
        >
          <UserPlus className="w-4 h-4" /> Crear Nuevo Usuario
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-900 p-3.5 rounded-xl border border-purple-500/30 flex items-start gap-3">
          <Shield className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-purple-300 text-xs block">Administrador</span>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Acceso total al sistema: gestión de usuarios, bitácora de auditoría ISO, configuración y control de catálogos.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-cyan-500/30 flex items-start gap-3">
          <KeyRound className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-cyan-300 text-xs block">Supervisor</span>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Gestión operativa: asignación de máquinas a técnicos, contratos, programación y aprobación de mantenimientos.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-amber-500/30 flex items-start gap-3">
          <Users className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300 text-xs block">Técnico de Soldadura</span>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Acceso restringido: consulta de sus máquinas asignadas y ejecución de órdenes de mantenimiento en campo.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o usuario..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 shrink-0">Filtrar por Rol:</span>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="TODOS">Todos los Roles ({usuarios.length})</option>
            <option value="Administrador">Administrador</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Técnico">Técnico</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-3">Usuario (Login)</th>
                <th className="p-3">Nombre Completo</th>
                <th className="p-3">Correo</th>
                <th className="p-3">Rol Asignado</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Fecha Creación</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsuarios.map(u => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-mono font-bold text-slate-100">
                    <div className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>@{u.username}</span>
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-slate-200">{u.nombre} {u.apellido}</td>
                  <td className="p-3 text-slate-400">{u.correo}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      u.rol === 'Administrador' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                      u.rol === 'Supervisor' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      u.estado === 'Activo' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {u.estado}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{u.fecha_creacion ? new Date(u.fecha_creacion).toLocaleDateString() : 'Hoy'}</td>
                  <td className="p-3 text-right space-x-1.5">
                    <button
                      onClick={() => handleResetPass(u.id, u.username)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded border border-slate-700 transition"
                      title="Cambiar Contraseña"
                    >
                      <Lock className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenModal(u)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
                      title="Editar Usuario"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {u.username !== 'admin' && (
                      <button
                        onClick={() => onToggleEstado(u.id)}
                        className={`p-1.5 rounded border transition ${
                          u.estado === 'Activo'
                            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}
                        title={u.estado === 'Activo' ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                      >
                        {u.estado === 'Activo' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">
                  {editingUser ? `Editar Usuario @${editingUser.username}` : 'Registrar Nuevo Usuario del Sistema'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Define las credenciales de acceso y el rol operativo.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Nombre <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    placeholder="Ej. Carlos"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Apellido <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    placeholder="Ej. Morales"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Correo Electrónico <span className="text-amber-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.correo}
                  onChange={e => setFormData({ ...formData, correo: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  placeholder="cmorales@prodima.gt"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Nombre de Usuario (Login) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                    placeholder="cmorales"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña de Acceso *'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!editingUser}
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 pr-8 font-mono focus:outline-none focus:border-amber-500"
                      placeholder={editingUser ? 'Dejar en blanco para no cambiar' : 'password123'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Rol en el Sistema <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={formData.rol}
                    onChange={e => setFormData({ ...formData, rol: e.target.value as RolUsuario })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Supervisor">Supervisor</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Estado de la Cuenta <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={formData.estado}
                    onChange={e => setFormData({ ...formData, estado: e.target.value as EstadoUsuario })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Al guardar, este usuario podrá iniciar sesión inmediatamente en la pantalla de bienvenida con el usuario y contraseña proporcionados.
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition shadow-md shadow-amber-500/10"
                >
                  {editingUser ? 'Guardar Cambios' : 'Registrar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
