import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash } from 'lucide-react';
import Layout from '../components/Layout';
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
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Recurring Transactions</h1>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
          >
            <PlusCircle className="mr-2" /> New Recurring Transaction
          </button>
        </div>

        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!isLoading && !error && (
          <div className="bg-white shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recurringTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{tx.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{tx.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{tx.frequency}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(tx.startDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleOpenModal(tx)} className="text-blue-500 hover:text-blue-700 mr-2">
                        <Edit />
                      </button>
                      <button onClick={() => handleDelete(tx.id)} className="text-red-500 hover:text-red-700">
                        <Trash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <RecurringTransactionModal
          transaction={currentTransaction}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </Layout>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{transaction ? 'Edit' : 'New'} Recurring Transaction</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                        <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">Frequency</label>
                        <select name="frequency" id="frequency" value={formData.frequency} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <div className="flex justify-end">
                        <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md mr-2">Cancel</button>
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RecurringTransactions;
