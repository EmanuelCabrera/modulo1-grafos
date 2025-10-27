const inquirer = require('inquirer');
const chalk = require('chalk');
const RedSocialService = require('../service/redSocialService');


function printPeople(people) {
  if (people.length === 0) {
    console.log('⚠️ No se encontraron personas');
    return;
  }
  
  console.log(`\n📋 Personas encontradas (${people.length}):`);
  people.forEach((person, index) => {
    console.log(`${index + 1}. ${person.name} (ID: ${person.id})`);
    if (person.email) {
      console.log(`   Email: ${person.email}`);
    }
  });
  console.log(''); // Línea en blanco para separar
}

async function mainMenu() {
  console.log('🔍 [DEBUG] Iniciando mainMenu()');
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '¿Qué querés hacer?',
      choices: [
        { name: 'Registrar persona', value: 'register' },
        { name: 'Listar personas', value: 'list' },
        { name: 'Eliminar persona', value: 'delete' },
        new inquirer.Separator(),
        { name: 'Salir', value: 'exit' }
      ]
    }
  ]);

  console.log(`🔍 [DEBUG] Acción seleccionada: ${action}`);

  try {
    switch (action) {
      case 'register': {
        console.log('🔍 [DEBUG] Entrando en case register');
        const { name, email, id } = await inquirer.prompt([
          { type: 'input', name: 'name', message: 'Nombre:', validate: v => v ? true : 'Obligatorio' },
          { type: 'input', name: 'email', message: 'Email (opcional):' },
          { type: 'input', name: 'id', message: 'ID personalizado (enter para UUID):' }
        ]);
        console.log('🔍 [DEBUG] Datos obtenidos, llamando a RedSocialService.registerPerson');
        const person = await RedSocialService.registerPerson({ id: id || undefined, name, email });
        console.log('🔍 [DEBUG] RedSocialService.registerPerson completado');
        console.log('✅ Persona creada/actualizada:');
        console.log(person);
        console.log('🔍 [DEBUG] Case register completado, saliendo del switch');
        break;
      }

      case 'list': {
        console.log('🔍 [DEBUG] Entrando en case list');
        const { q } = await inquirer.prompt([
          { type: 'input', name: 'q', message: 'Filtro por nombre/email (enter para todos):' }
        ]);
        console.log('🔍 [DEBUG] Filtro obtenido, llamando a RedSocialService.listPeople');
        console.log('🔍 Buscando personas...');
        const people = await RedSocialService.listPeople(q || undefined);
        console.log('🔍 [DEBUG] RedSocialService.listPeople completado, llamando a printPeople');
        printPeople(people);
        console.log('🔍 [DEBUG] printPeople completado, case list completado');
        break;
      }

      case 'delete': {
        console.log('🔍 [DEBUG] Entrando en case delete');
        const { id, confirm } = await inquirer.prompt([
          { type: 'input', name: 'id', message: 'ID de la persona a eliminar:', validate: v => !!v || 'Obligatorio' },
          { type: 'confirm', name: 'confirm', message: '¿Confirmás eliminar la persona y sus relaciones?' }
        ]);
        console.log('🔍 [DEBUG] Datos de eliminación obtenidos');
        if (confirm) {
          console.log('🔍 [DEBUG] Confirmación recibida, llamando a RedSocialService.deletePerson');
          await RedSocialService.deletePerson(id);
          console.log('🔍 [DEBUG] RedSocialService.deletePerson completado');
          console.log(`✅ Persona ${id} eliminada`);
        } else {
          console.log('🔍 [DEBUG] Eliminación cancelada');
          console.log('⚠️ Operación cancelada');
        }
        console.log('🔍 [DEBUG] Case delete completado');
        break;
      }

      case 'exit':
        console.log('🔍 [DEBUG] Entrando en case exit');
        console.log('👋 ¡Hasta luego!');
        console.log('🔍 [DEBUG] Retornando false desde case exit');
        return false;
    }
  } catch (e) {
    console.log('🔍 [DEBUG] Error capturado en mainMenu()');
    console.error('❌ Error:', e.message);
    console.error('📋 Stack:', e.stack);
    console.log('⚠️ Presiona Enter para continuar...');
    await inquirer.prompt([{ type: 'input', name: 'continue', message: '' }]);
    console.log('🔍 [DEBUG] Error manejado, continuando');
  }

  console.log('🔍 [DEBUG] mainMenu() completado, retornando true');
  return true;
}

async function runLoop() {
  let keepGoing = true;
  let iteration = 0;
  
  console.log('🔍 [DEBUG] Iniciando runLoop()');
  
  while (keepGoing) {
    iteration++;
    console.log(`🔍 [DEBUG] === Iteración ${iteration} del bucle ===`);
    console.log(`🔍 [DEBUG] keepGoing antes de mainMenu(): ${keepGoing}`);
    
    console.log('🔍 [DEBUG] Llamando a mainMenu()...');
    keepGoing = await mainMenu();
    console.log(`🔍 [DEBUG] mainMenu() retornó: ${keepGoing}`);
    
    if (keepGoing) {
      console.log('🔍 [DEBUG] keepGoing es true, esperando 1 segundo...');
      // Pequeña pausa para que el usuario vea el resultado
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('🔍 [DEBUG] Pausa completada, continuando bucle');
    } else {
      console.log('🔍 [DEBUG] keepGoing es false, saliendo del bucle');
    }
  }
  
  console.log('🔍 [DEBUG] runLoop() finalizado');
}

module.exports = { runLoop };