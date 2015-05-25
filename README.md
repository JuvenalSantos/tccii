### VInT - Visualização de Informações para Twitter

#### Pré-requisitos
 - Ubuntu 10.04
 - Apache 2.4.7
 - PHP 5.5.9
 - MySQL 5.5.41
 - phpMyAdmin 4.0.10
 - git 1.9.1
 - composer
 - nodeJs 0.10.25
 - npm 1.3.10
 - bower 1.4.1
 - grunt-cli 0.1.13


#### 1 - Preparação do ambiente no Ubuntu 10.04
Um tutorial detalhando dos passos descritos abaixo para instalação do Apache, Php e MySQL pode ser acessadp neste link: https://www.digitalocean.com/community/tutorials/como-instalar-a-pilha-linux-apache-mysql-php-lamp-no-ubuntu-14-04-pt

#####  Instalação do Apache
*sudo apt-get install apache2*

##### Instalação do MySQL
*sudo apt-get install mysql-server php5-mysql*

##### Instalação do PHP
*sudo apt-get install php5 libapache2-mod-php5 php-pear php5-cli php5-common php5-curl php5-gd php5-imagick php5-intl php5-json php5-mcrypt php5-memcache php5-ming*

##### Instalação do phpMyAdmin
*sudo apt-get install phpmyadmin*

##### Instalação do git
*sudo apt-get install git*

##### Instalação do composer
*cd /usr/bin* --*sudo php -r "readfile('https://getcomposer.org/installer');" | php*

##### Instalação do nodeJs e do npm
*sudo apt-get install nodejs*

*sudo apt-get install npm*

Importante: Após a instalação do nodejs, criar um link simbolico a partir do executavel do nodejs nomeado como node. 

*cd /usr/bin*

*sudo ln -s nodejs node*

##### Instalação do Bower e do Grunt
*sudo npm install -g bower*

*sudo npm install -g grunt-cli*

##### Criação do VirtualHost
*sudo vim /etc/apache2/sites-available/vint.dev.conf*

```
<VirtualHost *:80>
        ServerName vint.dev
        ServerAdmin webmaster@localhost
        DocumentRoot /var/www/html/vint/backend/web
        
        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

##### Adicionar endereço da aplicação nos hosts
*sudo vim /etc/hosts*

`127.0.0.1   vint.dev`

##### Alteração das configuração do PHP
*sudo vi /etc/php5/apache2/php.ini*
```
max_execution_time = 3000
max_input_time = -1
memory_limit = 512M
post_max_size = 200M
upload_max_filesize = 200M
```

##### Alteração das permissões de acesso do MySQL
*sudo /etc/apparmor.d/usr.sbin.mysqld*

Após `/usr/share/mysql/** r,` 
Inserir `/var/www/html/vint/backend/web/upload/** r,`

*sudo /etc/init.d/apparmor restart*


#### 2 - Instalação do projeto (VInT)

##### Clonando o repositório
*cd /var/www/html*

*git clone https://github.com/JuvenalSantos/vint.git*


#### 2.1 - Frontend

##### Instalação das dependências do Grunt
*cd vint/frontend*

*sudo npm install*

##### Instalação das dependências do projeto
*bower install*

##### Compilação manual do modulo angular-ui-bootstrap
*cd /components/angular-ui-bootstrap*

*sudo npm install*

*bower install*

*grunt build*

*grunt dist*

##### Criação do arquivo de configuração do ambiente
*sudo vim /var/www/html/vint/frontend/source/js/environment.js*
`var baseURL="http://vint.dev/app_dev.php/api/"`

##### Compilação do projeto (VInT)
*cd /var/www/html/vint/frontend*

*grunt build*

Importando o banco de dados
*Através do phpMyAdmin criar um banco de dados e realizar a importação do arquivo DB/db.sql*

#### 2.2 - Backend

##### Criação do link simbólico para o frontend
*cd /var/www/html/vint/backend/web*

*sudo ln -s /var/www/html/vint/frontend/dist*

##### Instalação das dependências do projeto
*cd /var/www/html/vint/backend*

*composer.phar install*

##### Configuração de permissão para os diretórios logs e cache
*chmod 777 -R app/logs app/cache*
