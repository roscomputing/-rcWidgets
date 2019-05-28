# Библиотека kendo виджетов РосКомпьютинг

### Версия разработчика

На машине разработчика должна быть установлена инфраструктура **node.js**

**1. Установите зависимости**

`npm i`

**2. Запустите сервер разработки**

`npm run dev`

_Пояснения:_

Сервер доступен ао адресу **localhost:3003** 

В данном случае, как отдельные виджеты, так и вся библиотека будут собраны для использования с загрузчиками **commonJs** и **requireJs**.
Если необходимо использовать виджеты как свойство глобального объекта - запустите `npm run dev-cdn`. 

Каждый виджет представлен отдельной отлапдочной страницей.
Для создания таковой необходимо в каталог виджета добавить шаблон **debug.hbs** на основе которого будет создана страница.
**пример: ./components/buttons/debug.hbs**

В версии разработчика основные зависимости (**jquery** и **kendo**) так же добавляются автоматически.

### Сборка библиотеки

В сборочном окружении должна быть установлена инфраструктура **node.js**

**1. Установите зависимости**

`npm i`

**2. Запустите сборку**

`npm run build`


_Пояснения:_

Как отдельные виджеты, так и полная библиотека будут собраны в директорию **dist**.
Версии предназначенные для добавления в глобальный объект будут иметь окончание **-cdn** и будут удобны при добавлении через элемент **script**.
Версии без суффикса предназначены для модульных загрузчиков **commonJs** и **requireJs**.

Библиотека в сборке не содержит зависимостей (**jquery** и **kendo**) для уменьшения размеров таковой и для успешной работы требует от конечного пользователя их добавления на страницу.









 



