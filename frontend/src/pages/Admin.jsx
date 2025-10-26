import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import api from '../api/client';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const fetchData = async () => {
    const [usersRes, transactionsRes, categoriesRes] = await Promise.all([
      api.get('/admin/users'),
      api.get('/admin/transactions'),
      api.get('/admin/categories')
    ]);
    setUsers(usersRes.data);
    setTransactions(transactionsRes.data);
    setCategories(categoriesRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      <Card title="Admin Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Total Users</h3>
            <p className="text-2xl">{users.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Total Transactions</h3>
            <p className="text-2xl">{transactions.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Total Categories</h3>
            <p className="text-2xl">{categories.length}</p>
          </div>
        </div>
      </Card>
      <Card title="Users">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
