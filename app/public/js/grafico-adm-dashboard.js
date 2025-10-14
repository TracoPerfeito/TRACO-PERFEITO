console.log("🔍 [grafico-adm-dashboard.js] Script do gráfico carregado.");

if (typeof labelsGrafico !== 'undefined' && typeof valoresGrafico !== 'undefined') {
  console.log("✅ Variáveis EJS existem.");
  console.log("📊 labelsGrafico =", labelsGrafico);
  console.log("📈 valoresGrafico =", valoresGrafico);

  const canvas = document.getElementById('perfilChart');
  if (!canvas) {
    console.error("❌ Elemento <canvas id='perfilChart'> não encontrado!");
  } else {
    console.log("✅ Canvas encontrado:", canvas);
  }

  const ctx = canvas?.getContext('2d');
  if (!ctx) {
    console.error("❌ Contexto 2D não pôde ser obtido!");
  } else {
    console.log("✅ Contexto 2D obtido:", ctx);
  }

  try {
    console.log("🚀 Tentando criar gráfico com Chart.js...");

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labelsGrafico, // datas vindas do banco
        datasets: [{
          label: 'Perfis Criados',
          data: valoresGrafico, // valores reais do banco
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
          legend: { display: false }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            title: { display: true, text: 'Cadastros' }
          },
          x: {
            grid: { display: false },
            title: { display: true, text: 'Data' }
          }
        }
      }
    });

    console.log("✅ Gráfico criado com sucesso!");
  } catch (erro) {
    console.error("💥 Erro ao criar gráfico:", erro);
  }

} else {
  console.warn("⚠️ Nenhum dado de gráfico disponível. Verifique se as variáveis EJS foram passadas corretamente.");
  console.log("labelsGrafico =", typeof labelsGrafico);
  console.log("valoresGrafico =", typeof valoresGrafico);
}
