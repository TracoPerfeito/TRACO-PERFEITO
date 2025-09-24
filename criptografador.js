// instalar o bcrypt se ainda não tiver: npm install bcrypt
const bcrypt = require("bcryptjs");
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Digite a senha que quer criptografar: ', async (senha) => {
  try {
    const saltRounds = 10; // complexidade do hash
    const hash = await bcrypt.hash(senha, saltRounds);
    console.log('Senha criptografada:', hash);
  } catch (err) {
    console.error('Erro ao criptografar:', err);
  }
  rl.close();
});
