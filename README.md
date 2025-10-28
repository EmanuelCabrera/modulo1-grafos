# 🌐 Red Social con Neo4j - Sistema de Grafos

Una aplicación de red social desarrollada con Node.js y Neo4j que implementa un sistema de grafos para gestionar personas y sus relaciones de amistad.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Funcionalidades](#-funcionalidades)
- [Restricciones de Integridad](#-restricciones-de-integridad)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Consultas Cypher](#-consultas-cypher)
- [Contribución](#-contribución)

## ✨ Características

### 🔧 Funcionalidades Básicas
- **Gestión de Personas**: Registro, listado, búsqueda y eliminación
- **Relaciones de Amistad**: Agregar y quitar amigos con relaciones bidireccionales
- **Búsqueda Inteligente**: Búsqueda case-insensitive por nombre, ciudad o hobby

### 🎯 Funcionalidades Avanzadas
- **Recomendaciones por Ciudad**: Sugiere personas de la misma ciudad
- **Recomendaciones por Hobby**: Sugiere personas con intereses similares
- **Estadísticas Completas**: Análisis de la red social con métricas detalladas

### 🛡️ Integridad de Datos
- **Nombres Únicos**: Constraint de unicidad en nombres de personas
- **Relaciones Simétricas**: Las amistades son automáticamente bidireccionales
- **Sin Duplicados**: Prevención automática de relaciones duplicadas

## 🛠️ Tecnologías

- **Backend**: Node.js
- **Base de Datos**: Neo4j (Base de datos de grafos)
- **Lenguaje de Consultas**: Cypher
- **CLI**: Inquirer.js para interfaz interactiva
- **Utilidades**: UUID para IDs únicos, Chalk para colores

## 🏗️ Arquitectura

### Patrón de Arquitectura
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CLI Layer     │    │  Service Layer  │    │Repository Layer │
│   (menu.js)     │───▶│(redSocialService)│───▶│(personasRepo)   │
│                 │    │                 │    │(amigosRepo)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │   Database      │
                                               │   (Neo4j)       │
                                               └─────────────────┘
```

### Capas de la Aplicación

1. **CLI Layer**: Interfaz de usuario interactiva
2. **Service Layer**: Lógica de negocio y validaciones
3. **Repository Layer**: Acceso a datos y consultas Cypher
4. **Database Layer**: Neo4j para almacenamiento de grafos

## 🚀 Instalación

### Prerrequisitos
- Node.js (v14 o superior)
- Neo4j Database (v4.0 o superior)

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd modulo1-grafos
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Neo4j**
   - Instalar Neo4j Desktop o Neo4j Community
   - Crear una base de datos
   - Anotar las credenciales de conexión

4. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus credenciales de Neo4j
   ```

5. **Configurar la base de datos**
   ```bash
   node src/setup.js
   ```

## ⚙️ Configuración

### Variables de Entorno (.env)
```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=tu_password
```

### Constraints y Índices
El script `setup.js` crea automáticamente:
- **Constraints de Unicidad**: `person_id_unique`, `person_name_unique`
- **Índices de Optimización**: `person_city`, `person_hobby`

## 🎮 Uso

### Iniciar la Aplicación
```bash
npm start
```

### Menú Principal
```
¿Qué querés hacer?
> Registrar persona
  Listar personas
  Eliminar persona
  Agregar amigo
  Quitar amigo
  Listar amigos
  ──────────────
  Recomendaciones por ciudad
  Recomendaciones por hobby
  Estadísticas
  ──────────────
  Salir
```

## 🔧 Funcionalidades Detalladas

### 👤 Gestión de Personas

#### Registrar Persona
- **Campos Requeridos**: Nombre completo, Ciudad
- **Campos Opcionales**: Edad, Hobby
- **Validación**: Nombres únicos (constraint de base de datos)

#### Listar Personas
- **Búsqueda**: Por nombre, ciudad o hobby (case-insensitive)
- **Ordenamiento**: Alfabético por nombre
- **Información**: Muestra ID, ciudad, edad y hobby

#### Eliminar Persona
- **Confirmación**: Pregunta antes de eliminar
- **Cascada**: Elimina automáticamente todas las relaciones
- **Búsqueda**: Por nombre completo

### 🤝 Gestión de Amistades

#### Agregar Amigo
- **Validación**: Verifica que ambas personas existan
- **Bidireccional**: Crea automáticamente ambas direcciones
- **Sin Duplicados**: Usa MERGE para evitar duplicados

#### Quitar Amigo
- **Bidireccional**: Elimina ambas direcciones de la relación
- **Feedback**: Confirma si se eliminó la relación

#### Listar Amigos
- **Búsqueda**: Por nombre completo
- **Sin Duplicados**: Usa DISTINCT para evitar duplicados
- **Ordenamiento**: Alfabético por nombre

### 🎯 Sistema de Recomendaciones

#### Recomendaciones por Ciudad
- **Algoritmo**: Encuentra personas de la misma ciudad que no sean amigos
- **Exclusión**: No incluye a sí mismo ni a amigos actuales
- **Caso de Uso**: Conocer gente de tu ciudad

#### Recomendaciones por Hobby
- **Algoritmo**: Encuentra personas con el mismo hobby que no sean amigos
- **Exclusión**: No incluye a sí mismo ni a amigos actuales
- **Caso de Uso**: Conocer gente con intereses similares

### 📊 Estadísticas

#### Métricas Incluidas
- **Total de Personas**: Cantidad de usuarios registrados
- **Total de Relaciones**: Cantidad de relaciones de amistad
- **Ciudades Únicas**: Número de ciudades diferentes
- **Hobbies Únicos**: Número de hobbies diferentes
- **Promedio de Amigos**: Promedio de conexiones por persona
- **Persona Más Conectada**: Usuario con más amigos

## 🛡️ Restricciones de Integridad

### 1. Nombres Únicos
```cypher
CREATE CONSTRAINT person_name_unique FOR (p:Person) REQUIRE p.name IS UNIQUE
```
- **Garantía**: No pueden existir dos personas con el mismo nombre
- **Validación**: A nivel de base de datos

### 2. Relaciones Simétricas
```cypher
MERGE (a)-[:FRIEND_WITH]->(b)
MERGE (b)-[:FRIEND_WITH]->(a)
```
- **Garantía**: Si A es amigo de B, entonces B es amigo de A
- **Implementación**: Creación automática de ambas direcciones

### 3. Sin Duplicados
```cypher
MERGE (a)-[:FRIEND_WITH]->(b)
```
- **Garantía**: No pueden existir relaciones duplicadas
- **Implementación**: MERGE evita duplicados automáticamente

## 📁 Estructura del Proyecto

```
modulo1-grafos/
├── src/
│   ├── cli/
│   │   └── menu.js              # Interfaz CLI interactiva
│   ├── db/
│   │   └── neo4j.js             # Configuración de conexión Neo4j
│   ├── repositories/
│   │   ├── personasRepository.js # Acceso a datos de personas
│   │   └── amigosRepository.js   # Acceso a datos de amistades
│   ├── service/
│   │   └── redSocialService.js  # Lógica de negocio
│   └── setup.js                 # Configuración inicial de BD
├── cleanup-duplicates.js        # Script de limpieza de duplicados
├── index.js                     # Punto de entrada de la aplicación
├── package.json                 # Dependencias y scripts
└── README.md                    # Este archivo
```

## 🔍 Consultas Cypher Principales

### Crear/Actualizar Persona
```cypher
MERGE (p:Person {id: $id})
ON CREATE SET p.name = $name, p.city = $city, p.age = $age, p.hobby = $hobby, p.createdAt = datetime()
ON MATCH SET p.name = coalesce($name, p.name), p.city = coalesce($city, p.city), p.age = coalesce($age, p.age), p.hobby = coalesce($hobby, p.hobby)
RETURN p
```

### Crear Relación Bidireccional
```cypher
MATCH (a:Person {id: $from}), (b:Person {id: $to})
MERGE (a)-[:FRIEND_WITH]->(b)
MERGE (b)-[:FRIEND_WITH]->(a)
```

### Buscar Amigos
```cypher
MATCH (p:Person {id: $id})-[:FRIEND_WITH]-(f:Person) 
RETURN DISTINCT f ORDER BY f.name
```

### Recomendaciones por Ciudad
```cypher
MATCH (p:Person {id: $personId})
MATCH (recommendation:Person)
WHERE recommendation.id <> $personId 
  AND NOT (p)-[:FRIEND_WITH]-(recommendation)
  AND recommendation.city = $city
RETURN DISTINCT recommendation ORDER BY recommendation.name
```

### Estadísticas de la Red
```cypher
MATCH (p:Person)
OPTIONAL MATCH (p)-[:FRIEND_WITH]-(friend:Person)
WITH p, count(friend) as friendCount
RETURN avg(friendCount) as average
```

## 🚨 Solución de Problemas

### Error de Constraint de Nombres Únicos
Si tienes datos existentes con nombres duplicados:
```bash
node cleanup-duplicates.js
node src/setup.js
```

### Error de Conexión a Neo4j
1. Verificar que Neo4j esté ejecutándose
2. Verificar credenciales en `.env`
3. Verificar que el puerto 7687 esté disponible

### Error de Índices Conflictivos
El script `setup.js` maneja automáticamente la eliminación de índices conflictivos.

## 🤝 Contribución

### Cómo Contribuir
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Estándares de Código
- **Comentarios**: Todas las consultas Cypher deben tener comentarios explicativos
- **Nomenclatura**: Usar camelCase para funciones y variables
- **Validación**: Siempre validar entrada de usuario
- **Manejo de Errores**: Usar try-catch y mensajes descriptivos

## 👨‍💻 Autor

Desarrollado como parte del curso de Arquitectura de Software - Módulo 1: Grafos

---

**¡Gracias por usar nuestra Red Social con Neo4j! 🌐✨**
