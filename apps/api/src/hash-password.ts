import * as argon2 from 'argon2';

async function main() {
  const password = 'password123';
  const hash = await argon2.hash(password);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  
  // Test verification
  const valid = await argon2.verify(hash, password);
  console.log(`Verification: ${valid}`);
}

main().catch(console.error);
