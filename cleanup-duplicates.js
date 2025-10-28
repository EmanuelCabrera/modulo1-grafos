const { getSession, closeDriver } = require('./src/db/neo4j');
require('dotenv').config();

(async () => {
  const session = getSession('WRITE');
  try {
    console.log('🔍 Buscando nombres duplicados...');
    
    // Buscar nombres duplicados
    const duplicatesResult = await session.run(`
      MATCH (p:Person)
      WITH p.name as name, collect(p) as persons
      WHERE size(persons) > 1
      RETURN name, persons
    `);
    
    if (duplicatesResult.records.length === 0) {
      console.log('✅ No se encontraron nombres duplicados');
    } else {
      console.log(`⚠️ Se encontraron ${duplicatesResult.records.length} nombres duplicados:`);
      
      for (const record of duplicatesResult.records) {
        const name = record.get('name');
        const persons = record.get('persons');
        
        console.log(`\n📋 Nombre duplicado: "${name}" (${persons.length} personas)`);
        
        // Mostrar información de cada persona duplicada
        for (let i = 0; i < persons.length; i++) {
          const person = persons[i];
          console.log(`   ${i + 1}. ID: ${person.properties.id}`);
          console.log(`      Ciudad: ${person.properties.city || 'N/A'}`);
          console.log(`      Edad: ${person.properties.age || 'N/A'}`);
          console.log(`      Hobby: ${person.properties.hobby || 'N/A'}`);
        }
        
        // Mantener solo la primera persona, eliminar las demás
        console.log(`\n🗑️ Eliminando duplicados de "${name}"...`);
        
        for (let i = 1; i < persons.length; i++) {
          const personToDelete = persons[i];
          console.log(`   Eliminando persona con ID: ${personToDelete.properties.id}`);
          
          // Eliminar la persona y todas sus relaciones
          await session.run(`
            MATCH (p:Person {id: $id})
            DETACH DELETE p
          `, { id: personToDelete.properties.id });
        }
        
        console.log(`✅ Duplicados de "${name}" eliminados`);
      }
    }
    
    console.log('\n🔍 Verificando que no queden duplicados...');
    const finalCheck = await session.run(`
      MATCH (p:Person)
      WITH p.name as name, collect(p) as persons
      WHERE size(persons) > 1
      RETURN count(name) as duplicateCount
    `);
    
    const duplicateCount = finalCheck.records[0].get('duplicateCount').toNumber();
    
    if (duplicateCount === 0) {
      console.log('✅ Limpieza completada. No quedan nombres duplicados.');
      console.log('\n💡 Ahora puedes ejecutar: node src/setup.js');
    } else {
      console.log(`❌ Aún quedan ${duplicateCount} nombres duplicados`);
    }
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message);
  } finally {
    await session.close();
    await closeDriver();
  }
})();
