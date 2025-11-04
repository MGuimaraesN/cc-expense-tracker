import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { getRecurringTransactions, createRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction } from '../api/recurring-transactions';
import { getCards } from '../api/cards';
import { getCategories } from '../api/categories';

const RecurringTransactions = () => {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [transactionsRes, cardsRes, categoriesRes] = await Promise.all([
        getRecurringTransactions(),
        getCards(),
        getCategories(),
      ]);
      setRecurringTransactions(transactionsRes.data.items);
      setCards(cardsRes.data);
      setCategories(categoriesRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data.');
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
      fetchData();
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save recurring transaction', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
      try {
        await deleteRecurringTransaction(id);
        fetchData();
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
            <thead className="text-gray-500 dark:text-white/60">
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
                <tr key={tx.id} className="border-t border-gray-200 dark:border-white/10">
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
          cards={cards}
          categories={categories}
        />
      )}
    </div>
  );
};

const RecurringTransactionModal = ({ transaction, onClose, onSave, cards, categories }) => {
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
                <input type="text" name="description" placeholder="Descrição" value={formData.description} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-slate-800 dark:border-gray-600" required />
                <input type="number" name="amount" placeholder="Valor" value={formData.amount} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-slate-800 dark:border-gray-600" required />
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="custom-select" required>
                    <option value="">Selecione a Categoria</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select name="cardId" value={formData.cardId} onChange={handleChange} className="custom-select">
                    <option value="">Selecione o Cartão</option>
                    {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select name="frequency" value={formData.frequency} onChange={handleChange} className="custom-select">
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                </select>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-slate-800 dark:border-gray-600" required />
                <div className="flex justify-end">
                    <Button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-700 mr-2">Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                </div>
            </form>
        </Modal>
    );
}

export default RecurringTransactions;
