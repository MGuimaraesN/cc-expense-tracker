import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { getRecurringTransactions, createRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction } from '../api/recurring-transactions'; // Assuming you'll create this API file

const RecurringTransactions = () => {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  useEffect(() => {
    fetchRecurringTransactions();
  }, []);

  const fetchRecurringTransactions = async () => {
    try {
      setIsLoading(true);
      const { data } = await getRecurringTransactions();
      setRecurringTransactions(data.items);
      setError(null);
    } catch (err) {
      setError('Failed to fetch recurring transactions.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (transaction = null) => {
    setCurrentTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTransaction(null);
  };

  const handleSave = async (transactionData) => {
    try {
      if (currentTransaction) {
        await updateRecurringTransaction(currentTransaction.id, transactionData);
      } else {
        await createRecurringTransaction(transactionData);
      }
      fetchRecurringTransactions();
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save recurring transaction', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
      try {
        await deleteRecurringTransaction(id);
        fetchRecurringTransactions();
      } catch (err) {
        console.error('Failed to delete recurring transaction', err);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Nova Transação Recorrente">
        <Button onClick={() => handleOpenModal()}>Nova Transação</Button>
      </Card>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!isLoading && !error && (
        <Card title="Transações Recorrentes">
          <table className="w-full text-sm">
            <thead className="text-white/60">
              <tr>
                <th className="text-left">Descrição</th>
                <th className="text-left">Valor</th>
                <th className="text-left">Frequência</th>
                <th className="text-left">Data de Início</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recurringTransactions.map((tx) => (
                <tr key={tx.id} className="border-t border-white/10">
                  <td>{tx.description}</td>
                  <td>{tx.amount}</td>
                  <td>{tx.frequency}</td>
                  <td>{new Date(tx.startDate).toLocaleDateString()}</td>
                  <td className="text-right">
                    <Button onClick={() => handleOpenModal(tx)} className="bg-slate-600 hover:bg-slate-700 mr-2">Editar</Button>
                    <Button onClick={() => handleDelete(tx.id)} className="bg-red-600 hover:bg-red-700">Excluir</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {isModalOpen && (
        <RecurringTransactionModal
          transaction={currentTransaction}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

const RecurringTransactionModal = ({ transaction, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        description: transaction?.description || '',
        amount: transaction?.amount || '',
        frequency: transaction?.frequency || 'monthly',
        startDate: transaction?.startDate ? new Date(transaction.startDate).toISOString().split('T')[0] : '',
        categoryId: transaction?.categoryId || '',
        cardId: transaction?.cardId || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal title={transaction ? 'Editar Transação Recorrente' : 'Nova Transação Recorrente'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="description" placeholder="Descrição" value={formData.description} onChange={handleChange} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1 w-full" required />
                <input type="number" name="amount" placeholder="Valor" value={formData.amount} onChange={handleChange} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1 w-full" required />
                <select name="frequency" value={formData.frequency} onChange={handleChange} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1 w-full">
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                </select>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="bg-white/5 border border-white/10 text-white rounded px-2 py-1 w-full" required />
                <div className="flex justify-end">
                    <Button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-700 mr-2">Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                </div>
            </form>
        </Modal>
    );
}

export default RecurringTransactions;
