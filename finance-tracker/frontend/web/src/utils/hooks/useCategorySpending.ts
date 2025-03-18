import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { transactionService } from '../apiServices';
import { Category } from '../types';

const useCategorySpending = (categories: Category[], timeFilter: string) => {
  const [categorySpending, setCategorySpending] = useState<{[key: string]: number}>({});
  const [loadingSpending, setLoadingSpending] = useState(false);

  // Generate list of available months
  const getAvailableMonths = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const label = date.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
      
      months.push({ value, label });
    }
    
    return months;
  };
  
  const availableMonths = getAvailableMonths();

  // Fetch spending data when timeFilter changes
  useEffect(() => {
    if (timeFilter !== 'all' && categories.length > 0) {
      fetchMonthlySpending();
    }
  }, [timeFilter, categories]);

  // Function to fetch spending data for the selected month
  const fetchMonthlySpending = async () => {
    setLoadingSpending(true);
    
    try {
      let startDate, endDate;
      
      if (timeFilter === 'current-month') {
        // For current month
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1; // getMonth() is 0-based
        
        startDate = format(new Date(currentYear, currentMonth - 1, 1), 'yyyy-MM-dd');
        endDate = format(new Date(currentYear, currentMonth, 0), 'yyyy-MM-dd'); // Last day of month
      } else {
        // For specific selected month
        const [year, month] = timeFilter.split('-');
        startDate = format(new Date(parseInt(year), parseInt(month) - 1, 1), 'yyyy-MM-dd');
        endDate = format(new Date(parseInt(year), parseInt(month), 0), 'yyyy-MM-dd'); // Last day of month
      }
      
      console.log('Fetching spending data for period:', startDate, 'to', endDate);
      
      const response = await transactionService.getAll({
        startDate,
        endDate,
        type: 'EXPENSE',
        limit: 1000 // High limit to get all transactions
      });
      
      console.log('Spending data response:', response);
      
      const spending: {[key: string]: number} = {};
      
      // Initialize all categories with 0
      categories.forEach(category => {
        spending[category.id] = 0;
      });
      
      // Sum up expenses by category
      if (response.data) {
        response.data.forEach(transaction => {
          const categoryId = transaction.category.id;
          if (spending[categoryId] !== undefined) {
            spending[categoryId] += Number(transaction.amount);
          } else {
            spending[categoryId] = Number(transaction.amount);
          }
        });
      }
      
      console.log('Calculated spending by category:', spending);
      
      setCategorySpending(spending);
    } catch (error) {
      console.error('Error fetching spending data:', error);
    } finally {
      setLoadingSpending(false);
    }
  };

  return {
    categorySpending,
    loadingSpending,
    availableMonths,
    fetchMonthlySpending
  };
};

export default useCategorySpending; 