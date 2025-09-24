document.querySelectorAll('.btn-denunciar-usuario').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.id;
    document.getElementById('idUsuarioDenunciadoInput').value = id;
    document.getElementById('modalDenunciaUsuario').style.display = 'block';
  });
});

document.getElementById('fecharModalUsuario').addEventListener('click', () => {
  document.getElementById('modalDenunciaUsuario').style.display = 'none';
});

document.getElementById('formDenunciaUsuario').addEventListener('submit', async (e) => {
  e.preventDefault();
  const idUsuarioDenunciado = document.getElementById('idUsuarioDenunciadoInput').value;
  const motivoInput = document.querySelector('input[name="motivo"]:checked');
  if (!motivoInput) return alert('Escolha um motivo');
  const motivo = motivoInput.value;

  try {
    const res = await fetch('/denunciar-usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idUsuarioDenunciado, motivo })
    });
    const data = await res.json();
    if (data.sucesso) {
      alert('Denúncia enviada!');
      document.getElementById('modalDenunciaUsuario').style.display = 'none';
    } else {
      alert('Erro: ' + data.erro);
    }
  } catch (err) {
    console.log(err);
    alert('Erro ao enviar denúncia');
  }
});
