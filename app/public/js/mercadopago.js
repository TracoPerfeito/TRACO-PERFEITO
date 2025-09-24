//  const mercadopago = new MercadoPago('APP_USR-94fd4658-b8ab-4b6f-87d3-b2c294f818ba', { locale: 'pt-BR' });
// console.log("MercadoPago inicializado:", mercadopago);

// document.querySelectorAll(".plano-btn").forEach(button => {
//     button.addEventListener("click", () => {
//         const plano = button.dataset.plano;
//         console.log("Botão clicado, plano selecionado:", plano);

//         fetch("/create-preference", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ plano: plano })
//         })
//         .then(res => {
//             console.log("Resposta do fetch recebida:", res);
//             return res.json();
//         })
//         .then(data => {
//             console.log("Dados da preferência recebidos do backend:", data);
//             if(data && data.id){
//                 console.log("Criando botão de checkout com preferenceId:", data.id);
//                 createCheckoutButton(data.id);
//             } else {
//                 console.warn("Nenhum preferenceId retornado do backend:", data);
//             }
//         })
//         .catch(err => {
//             console.error("Erro ao criar preferência:", err);
//         });
//     });
// });

// function createCheckoutButton(preferenceId) {
//     console.log("createCheckoutButton chamado com preferenceId:", preferenceId);
//     const bricksBuilder = mercadopago.bricks();
//     console.log("Bricks builder criado:", bricksBuilder);

//     const renderComponent = async (bricksBuilder) => {
//         console.log("renderComponent iniciado");
//         if (window.checkoutButton) {
//             console.log("Desmontando botão existente");
//             window.checkoutButton.unmount();
//         }

//         try {
//             window.checkoutButton = await bricksBuilder.create(
//                 "wallet",
//                 "button-checkout",
//                 {
//                     initialization: { preferenceId: preferenceId },
//                     callbacks: {
//                         onError: (error) => console.error("Erro no checkout:", error),
//                         onReady: () => console.log("Botão pronto e visível!")
//                     }
//                 }
//             );
//             console.log("Botão de checkout criado e renderizado:", window.checkoutButton);
//         } catch (err) {
//             console.error("Erro ao renderizar componente:", err);
//         }
//     };

//     renderComponent(bricksBuilder);
// }
