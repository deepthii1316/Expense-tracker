// Function to get the start and end dates of the current week (Sunday to Saturday)
function getWeekRange(date) {
  const day = date.getDay(); // 0 for Sunday, 6 for Saturday
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to get to Monday, then subtract 6 days to get to previous Sunday
  const startOfWeek = new Date(date.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return { start: startOfWeek, end: endOfWeek };
}


function addExpense() {
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  if (!desc || !amount || !category || !date) {
    alert("Please fill all fields.");
    return;
  }

  // Date validation: Do not allow to add date after today's date
  const selectedDate = new Date(date);
  const today = new Date();
  // today.setHours(0, 0, 0, 0); // Normalize today's date to compare only dates

  if (selectedDate > today) {
    alert("Cannot add an expense for a future date.");
    return;
  }

  const expense = { desc, amount, category, date };
  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  expenses.push(expense);
  localStorage.setItem("expenses", JSON.stringify(expenses));

  updateTotals();
  updateWeeklyChart(); // Call to update chart after adding expense
  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("category").value = "";
  document.getElementById("date").value = "";
}

function updateTotals() {
  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  let weekTotal = 0, monthTotal = 0;

  const currentWeekRange = getWeekRange(new Date());
  const month = new Date().getMonth(); // Current month (0-indexed)
  const year = new Date().getFullYear(); // Current year

  expenses.forEach(({ amount, date }) => {
    const expDate = new Date(date);
    if (expDate >= currentWeekRange.start && expDate <= currentWeekRange.end) {
      weekTotal += parseFloat(amount);
    }
    if (expDate.getFullYear() === year && expDate.getMonth() === month) {
      monthTotal += parseFloat(amount);
    }
  });

  document.getElementById("weekTotal").innerText = `${weekTotal.toFixed(2)}`;
  document.getElementById("monthTotal").innerText = `${monthTotal.toFixed(2)}`;
}

// Chart.js global instance
let weeklyChartInstance = null;

function updateWeeklyChart() {
  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  const weeklySpending = new Array(7).fill(0); // 7 days of the week

  const currentWeekRange = getWeekRange(new Date());
  const weekStartDay = currentWeekRange.start.getDay(); // Day of the week for the start of the week (0 for Sunday)

  expenses.forEach(({ amount, date }) => {
    const expDate = new Date(date);
    if (expDate >= currentWeekRange.start && expDate <= currentWeekRange.end) {
      const dayOfWeek = expDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
      // Adjust index if week starts on a different day (e.g., Monday as 0)
      const chartIndex = (dayOfWeek - weekStartDay + 7) % 7;
      weeklySpending[chartIndex] += parseFloat(amount);
    }
  });

  const ctx = document.getElementById("weeklyChart").getContext("2d");

  // Destroy existing chart if it exists
  if (weeklyChartInstance) {
    weeklyChartInstance.destroy();
  }

  // Labels for the days of the week, starting with Sunday
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  weeklyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Spending',
        data: weeklySpending,
        backgroundColor: 'rgba(52, 152, 219, 0.8)', // Blue color for bars
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(236, 240, 241, 0.1)' // Lighter grid lines for dark theme
          },
          ticks: {
            color: '#ecf0f1' // Lighter tick labels
          }
        },
        x: {
          grid: {
            color: 'rgba(236, 240, 241, 0.1)'
          },
          ticks: {
            color: '#ecf0f1'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#ecf0f1' // Lighter legend labels
          }
        }
      }
    }
  });
}
function clearAllExpenses() {
  if (confirm("Are you sure you want to clear all expenses? This action cannot be undone.")) {
    localStorage.removeItem("expenses");
    updateTotals();
    updateWeeklyChart(); // Also update the chart after clearing
    alert("All expenses have been cleared.");
  }
}

window.onload = () => {
  updateTotals();
  updateWeeklyChart(); // Initial chart load
  
};