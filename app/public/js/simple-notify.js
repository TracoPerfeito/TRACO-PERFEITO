function notify(titulo, texto, tipo, posicao, duracao = 3000) {

  const safeTitulo = titulo != null ? String(titulo) : "";
  const safeTextoRaw = texto != null ? texto : "";
  const safeTexto = String(safeTextoRaw).replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  const accepted = ['info','success','warning','error'];
  const tipoLower = (tipo || "").toString().toLowerCase();
  const status = (function(t){
    if (accepted.includes(t)) return t;
    if (t === 'msg' || t === 'message' || t === 'chat') return 'info';
    if (t === 'ok') return 'success';
    // fallback
    return 'info';
  })(tipoLower);

  const options = {
    status,            
    title: safeTitulo,
    text: safeTexto,
    effect: 'fade',
    speed: 500,
    showIcon: true,
    showCloseButton: true,
    autoclose: true,
    autotimeout: duracao,
    gap: 20,
    distance: 20,
  
    position: posicao || 'top right'
  };

  console.log('Notify → options:', options);

  
  new Notify(options);

  setTimeout(() => {
    const els = Array.from(document.body.querySelectorAll('*')).filter(el =>
      el.textContent && el.textContent.includes('undefined')
    );
    if (els.length) {
      console.warn('Elementos que contêm "undefined":', els);
      els.forEach((el, i) => console.log(`#${i}`, el.outerHTML));
    } else {
      console.log('Nenhum "undefined" encontrado no DOM após a notificação.');
    }
  }, 120);
}
