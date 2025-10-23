import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../api/client';
import Notification from '../components/Notification';

export default function Settings() {
  const [password, setPassword] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notification, setNotification] = useState({ message: '', type: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      setNotification({ message: 'As senhas não conferem', type: 'error' });
      return;
    }

    try {
      await api.put('/auth/change-password', {
        oldPassword: password.oldPassword,
        newPassword: password.newPassword
      });
      setNotification({ message: 'Senha alterada com sucesso!', type: 'success' });
      setPassword({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setNotification({ message: 'Erro ao alterar senha', type: 'error' });
    }
  };

  return (
    <div className="space-y-4">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />
      <Card title="Alterar Senha">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha Antiga</label>
            <Input
              type="password"
              value={password.oldPassword}
              onChange={(e) => setPassword({ ...password, oldPassword: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nova Senha</label>
            <Input
              type="password"
              value={password.newPassword}
              onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Nova Senha</label>
            <Input
              type="password"
              value={password.confirmPassword}
              onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
              required
            />
          </div>
          <Button type="submit">Alterar Senha</Button>
        </form>
      </Card>
    </div>
  );
}
