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
    console.log(`   Ciudad: ${person.city}`);
    if (person.age) {
      console.log(`   Edad: ${person.age}`);
    }
    if (person.hobby) {
      console.log(`   Hobby: ${person.hobby}`);
    }
  });
  console.log(''); // Línea en blanco para separar
}

async function mainMenu() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '¿Qué querés hacer?',
      choices: [
        { name: 'Registrar persona', value: 'register' },
        { name: 'Listar personas', value: 'list' },
        { name: 'Eliminar persona', value: 'delete' },
        { name: 'Agregar amigo', value: 'addFriend' },
        { name: 'Quitar amigo', value: 'removeFriend' },
        { name: 'Listar amigos', value: 'listFriends' },
        new inquirer.Separator(),
        { name: 'Recomendaciones por ciudad', value: 'cityRecommendations' },
        { name: 'Recomendaciones por hobby', value: 'hobbyRecommendations' },
        { name: 'Estadísticas', value: 'statistics' },
        new inquirer.Separator(),
        { name: 'Salir', value: 'exit' }
      ]
    }
  ]);

  try {
    switch (action) {
      case 'register': {
        const { name, city, age, hobby } = await inquirer.prompt([
          { type: 'input', name: 'name', message: 'Nombre completo:', validate: v => v ? true : 'Obligatorio' },
          { type: 'input', name: 'city', message: 'Ciudad:', validate: v => v ? true : 'Obligatorio' },
          { type: 'input', name: 'age', message: 'Edad (opcional):' },
          { type: 'input', name: 'hobby', message: 'Hobby (opcional):' }
        ]);
        const person = await RedSocialService.registerPerson({ 
          name, 
          city, 
          age: age ? parseInt(age) : null, 
          hobby: hobby || null 
        });
        console.log('✅ Persona creada/actualizada:');
        console.log(person);
        break;
      }

      case 'list': {
        const { q } = await inquirer.prompt([
          { type: 'input', name: 'q', message: 'Filtro por nombre/ciudad/hobby (enter para todos):' }
        ]);
        console.log('🔍 Buscando personas...');
        const people = await RedSocialService.listPeople(q || undefined);
        printPeople(people);
        break;
      }

      case 'delete': {
        const { name, confirm } = await inquirer.prompt([
          { type: 'input', name: 'name', message: 'Nombre completo de la persona a eliminar:', validate: v => !!v || 'Obligatorio' },
          { type: 'confirm', name: 'confirm', message: '¿Estás seguro de que querés eliminar esta persona y todas sus relaciones de amistad?' }
        ]);
        if (confirm) {
          await RedSocialService.deletePersonByName(name);
          console.log(`✅ Persona "${name}" eliminada exitosamente`);
        } else {
          console.log('⚠️ Operación cancelada');
        }
        break;
      }

      case 'addFriend': {
        const { fromName, toName } = await inquirer.prompt([
          { type: 'input', name: 'fromName', message: 'Nombre completo de la persona que quiere agregar amigo:' },
          { type: 'input', name: 'toName', message: 'Nombre completo de la persona a agregar:' }
        ]);
        await RedSocialService.addFriendByName(fromName, toName);
        break;
      }

      case 'removeFriend': {
        const { fromName, toName } = await inquirer.prompt([
          { type: 'input', name: 'fromName', message: 'Nombre completo de la persona que quiere quitar amigo:' },
          { type: 'input', name: 'toName', message: 'Nombre completo de la persona a quitar:' }
        ]);
        await RedSocialService.removeFriendByName(fromName, toName);
        break;
      }

      case 'listFriends': {
        const { name } = await inquirer.prompt([
          { type: 'input', name: 'name', message: 'Nombre completo de la persona para listar amigos:' }
        ]);
        const friends = await RedSocialService.listFriendsByName(name);
        printPeople(friends);
        break;
      }

      case 'cityRecommendations': {
        const { name } = await inquirer.prompt([
          { type: 'input', name: 'name', message: 'Nombre completo de la persona para recomendaciones por ciudad:' }
        ]);
        const recommendations = await RedSocialService.getCityRecommendations(name);
        console.log('\n🏙️ Recomendaciones por ciudad:');
        printPeople(recommendations);
        break;
      }

      case 'hobbyRecommendations': {
        const { name } = await inquirer.prompt([
          { type: 'input', name: 'name', message: 'Nombre completo de la persona para recomendaciones por hobby:' }
        ]);
        const recommendations = await RedSocialService.getHobbyRecommendations(name);
        console.log('\n🎯 Recomendaciones por hobby:');
        printPeople(recommendations);
        break;
      }

      case 'statistics': {
        const stats = await RedSocialService.getStatistics();
        console.log('\n📊 Estadísticas de la Red Social:');
        console.log(`👥 Total de personas: ${stats.totalPeople}`);
        console.log(`🤝 Total de relaciones de amistad: ${stats.totalRelationships}`);
        console.log(`🏙️ Ciudades únicas: ${stats.uniqueCities}`);
        console.log(`🎯 Hobbies únicos: ${stats.uniqueHobbies}`);
        console.log(`📈 Promedio de amigos por persona: ${stats.averageFriends.toFixed(1)}`);
        console.log(`👑 Persona con más amigos: ${stats.mostConnectedPerson || 'N/A'}`);
        break;
      }

      case 'exit':
        console.log('👋 ¡Hasta luego!');
        return false;
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
    console.log('⚠️ Presiona Enter para continuar...');
    await inquirer.prompt([{ type: 'input', name: 'continue', message: '' }]);
  }

  return true;
}

async function runLoop() {
  let keepGoing = true;
  
  while (keepGoing) {
    keepGoing = await mainMenu();
    
    if (keepGoing) {
      // Pequeña pausa para que el usuario vea el resultado
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

module.exports = { runLoop };