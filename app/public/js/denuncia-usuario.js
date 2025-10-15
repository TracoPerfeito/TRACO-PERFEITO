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
