import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const BankPage = () => {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

  const fetchBankData = async () => {
    setIsLoading(true);
    try {
      const [accRes, txRes] = await Promise.all([
        api.get('/bank/account'),
        api.get('/bank/transactions')
      ]);
      setAccount(accRes.data.data);
      setTransactions(txRes.data.data);
    } catch (error) {
      console.error('Error loading bank data:', error);
      toast.error('Failed to load bank details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBankData();
  }, []);

  const handleDeposit = async (e) => {
    e.preventDefault();
    const amount = Number(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsDepositing(true);
    const toastId = toast.loading('Depositing funds...');
    try {
      const res = await api.post('/bank/deposit', { amount });
      toast.success(`₹${amount.toLocaleString('en-IN')} deposited successfully!`, { id: toastId });
      setAccount(res.data.data);
      setDepositAmount('');
      setIsDepositModalOpen(false);
      // Refresh transactions
      const txRes = await api.get('/bank/transactions');
      setTransactions(txRes.data.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Deposit failed', { id: toastId });
    } finally {
      setIsDepositing(false);
    }
  };

  const getTransactionDetails = (tx) => {
    const isOffline = tx.description && tx.description.toLowerCase().includes('offline');
    const isCredit = 
      tx.type === 'DEPOSIT' || 
      (tx.type === 'PAYMENT' && tx.receiver?._id === account?.user) ||
      (tx.type === 'REFUND' && tx.receiver?._id === account?.user);
      
    return {
      isCredit,
      isOffline,
      sign: isOffline ? '' : (isCredit ? '+' : '-'),
      colorClass: isOffline ? 'text-slate-550 font-bold' : (isCredit ? 'text-emerald-600 font-extrabold' : 'text-rose-600 font-extrabold'),
      icon: isOffline ? 'handshake' : (tx.type === 'DEPOSIT' ? 'arrow_downward' : tx.type === 'REFUND' ? 'replay' : 'arrow_upward'),
      badgeClass: isOffline ? 'bg-slate-100 text-slate-600 border-slate-200' :
                  (tx.type === 'DEPOSIT' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  tx.type === 'REFUND' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                  'bg-blue-50 text-blue-700 border-blue-100')
    };
  };

  if (isLoading && !account) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary-500">autorenew</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* Header */}
      <div>
        <h1 className="text-[20px] font-black text-slate-800 leading-none mb-1">🏦 Mock Bank Account</h1>
        <p className="text-[11px] text-slate-500 font-medium">Manage your simulated bank balance, perform top-ups, and review transaction history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Card Section */}
        <div className="md:col-span-2 space-y-4">
          {account && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-[1.58/1] w-full rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-5 shadow-lg overflow-hidden flex flex-col justify-between border border-emerald-500/20"
            >
              {/* Card Glare & Shapes */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />

              {/* Header */}
              <div className="flex justify-between items-start z-10">
                <div>
                  <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest leading-none">Simulated Account</p>
                  <p className="text-[12px] font-black mt-1">{account.bankName}</p>
                </div>
                <span className="material-symbols-outlined text-3xl opacity-80">contactless</span>
              </div>

              {/* Chip & Balance */}
              <div className="my-2 z-10 flex justify-between items-end">
                <div className="w-10 h-7 bg-amber-300/80 rounded-md border border-amber-400/50 flex items-center justify-center overflow-hidden">
                  {/* Micro Chip Lines */}
                  <div className="grid grid-cols-3 gap-0.5 w-full h-full p-1 opacity-60">
                    <div className="border border-slate-900/30 rounded-sm"></div>
                    <div className="border border-slate-900/30 rounded-sm"></div>
                    <div className="border border-slate-900/30 rounded-sm"></div>
                    <div className="border border-slate-900/30 rounded-sm"></div>
                    <div className="border border-slate-900/30 rounded-sm"></div>
                    <div className="border border-slate-900/30 rounded-sm"></div>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="text-[9px] font-bold opacity-70 uppercase block">Available Balance</span>
                  <span className="text-[20px] font-black">₹{account.balance.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Account details footer */}
              <div className="z-10 flex justify-between items-end">
                <div>
                  <p className="text-[8px] font-bold opacity-60 uppercase tracking-wider">Account Holder</p>
                  <p className="text-[11px] font-extrabold truncate max-w-[120px]">{account.accountHolderName}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold opacity-60 uppercase tracking-wider text-right">Account / IFSC</p>
                  <p className="text-[11px] font-mono font-bold leading-none">{account.accountNumber}</p>
                  <p className="text-[9px] font-mono opacity-80 text-right leading-tight mt-0.5">{account.ifscCode}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Deposit trigger */}
          <button 
            onClick={() => setIsDepositModalOpen(true)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-[12.5px] transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            Deposit Mock Funds
          </button>
        </div>

        {/* Ledger Transactions Section */}
        <div className="md:col-span-3">
          <div className="global-card min-h-[300px] flex flex-col">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-[13px] font-bold text-slate-800">Transaction History</h3>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{transactions.length} records</span>
            </div>

            {transactions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">payments</span>
                <p className="text-[12px] font-bold text-slate-500">No transactions yet</p>
                <p className="text-[10px] text-slate-400 max-w-xs mt-0.5">Fund transfers, deposits, and refunds will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 overflow-y-auto max-h-[350px]">
                {transactions.map((tx) => {
                  const details = getTransactionDetails(tx);
                  return (
                    <div key={tx._id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${details.badgeClass}`}>
                          <span className="material-symbols-outlined text-[16px]">{details.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-extrabold text-slate-800 truncate">{tx.description}</p>
                          <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                            {new Date(tx.createdAt).toLocaleString('en-IN', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0 ml-4">
                        <p className={`text-[13.5px] ${details.colorClass}`}>
                          {details.sign}₹{tx.amount.toLocaleString('en-IN')}
                        </p>
                        <p className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-0.5 ${
                          details.isOffline 
                            ? 'bg-slate-100 text-slate-650 border border-slate-200/60' 
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {details.isOffline ? 'Offline Paid' : tx.status}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {isDepositModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !isDepositing && setIsDepositModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 z-10 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div>
                  <h3 className="text-[14px] font-extrabold text-slate-800">Deposit Mock Money</h3>
                  <p className="text-[9px] text-slate-400 font-bold mt-0.5">Instantly add test funds to account</p>
                </div>
                <button 
                  onClick={() => setIsDepositModalOpen(false)}
                  disabled={isDepositing}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-500 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              </div>

              <form onSubmit={handleDeposit} className="p-5 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Deposit Amount (₹)</label>
                  <input 
                    type="number"
                    required
                    placeholder="e.g. 50000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full h-10 px-3 text-[13px] rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-extrabold"
                    disabled={isDepositing}
                    min="1"
                  />
                </div>

                {/* Preset Options */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[10000, 25000, 50000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDepositAmount(val.toString())}
                      className="h-8 rounded-lg border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 font-bold text-[11px] bg-white transition-all cursor-pointer"
                      disabled={isDepositing}
                    >
                      +₹{val.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDepositModalOpen(false)}
                    className="flex-1 h-9 rounded-xl border border-slate-200 text-slate-500 font-bold text-[12px] hover:bg-slate-50 transition-colors cursor-pointer"
                    disabled={isDepositing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                    disabled={isDepositing || !depositAmount}
                  >
                    {isDepositing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : 'Confirm Deposit'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BankPage;
