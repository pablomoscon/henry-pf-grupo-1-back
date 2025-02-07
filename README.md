![logo The Fancy Box](./public/logoReadme.png)

> ### Descripción del Proyecto:

El objetivo de esta App es modernizar y optimizar el acceso a servicios exclusivos de alojamiento de lujo para gatos. Permitiendo a los usuarios:

- Acceder a información detallada del alojamiento, como fotografías y descripciones de los servicios.
- Recibir notificaciones y recordatorios sobre reservas y fechas clave como el check-in y check-out.
- Una experiencia exclusiva e intuitiva para gestionar reservas en tiempo real.
- Mantener una comunicación directa con cuidadores mediante un sistema de chat en tiempo real.
- Acceso a una bitácora con fotos, videos y posteos sobre la estadía del huésped gatuno, actualizados por su cuidador.

##### GitHub Pages: <https://github.com/pablomoscon/henry-pf-grupo-1-back>

##### GitHub Pages Front: <https://github.com/courreges-do/henry-pf-grupo-1-front>

##### Documentación Back: <https://thefancybox-api-latest.onrender.com/doc>

> ### Herramientas utilizadas

- NestJs
- Postgres SQL
- Nodemailer.
- Cloudinary.
- OpenApi/Swagger.
- Render.
- Crons.
- WebSockets.

### Pasos para ejecutar el proyecto localmente

1. Clonar Repositorio: git clone <https://github.com/pablomoscon/henry-pf-grupo-1-back>
2. Dentro de la carpeta del proyecto ejecutar: npm install
3. Posteriormente ejecutar: npm run start

> ### Configuración de Variables de Entorno

Para ejecutar este proyecto, es necesario crear un archivo .env en el directorio raíz con el nombre .env.development.local y agregar lo siguiente

#### JWT

JWT_SECRET=your_jwt_secret

#### Cloudinary

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

#### Google OAuth

CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
REDIRECT_URI=your_redirect_uri

#### Base de Datos en Render

POSTGRES_DB=your_database_name
POSTGRES_USER=your_database_user
POSTGRES_PASSWORD=your_database_password
POSTGRES_HOST=your_database_host
POSTGRES_PORT=your_database_port
DB_TYPE=postgres
POSTGRES_CONNECTION=your_connection_string

#### Stripe

STRIPE_SECRET_KEY=your_stripe_secret_key

#### Nodemailer

EMAIL_USER= your_email@example.com
EMAIL_PASSWORD= your_email_password
