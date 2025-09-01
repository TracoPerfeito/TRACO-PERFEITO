const ctx = document.getElementById('perfilChart').getContext('2d');
    const perfilChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        datasets: [{
          label: 'Perfis Criados',
          data: [150, 180, 200, 170, 190, 210, 250, 280, 230, 260, 270, 240],
          fill: true,
          backgroundColor: 'rgba(59,130,246,0.08)',
          borderColor: 'rgba(59,130,246,1)',
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: 'rgba(59,130,246,1)'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return ` ${context.parsed.y} perfis criados`;
              }
            }
          },
          legend: {
            display: false
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 50
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });