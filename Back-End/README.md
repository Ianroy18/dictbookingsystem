## Installation process

# install xampp and python3.9.0

https://www.python.org/ftp/python/3.9.0/python-3.9.0-amd64.exe

# create a database in your phpmyadmin name sample_db

# run pip install pipenv

# run pipenv shell

# run pipenv install

# run pip install django 

# run pip install -r requirements.txt


# run python manage.py migrate

# run pip install django-extensions

# run python manage.py runserver 0.0.0.0:8000


## Deployment process


clone the backend repo  Github-> PythonAnywhere 

paste the code :
mkvirtualenv --python=/usr/bin/python3.9 venv


cd  /repo
pip install -r requirements.txt


go to database create one
create db, and remember password
copy the Database host address: Zipfile.mysql.pythonanywhere-services.com
Username:Zipfile


create a webpage

input venv on virtualenv:



got to WSGI configuration file:
update the file
the Zipfile is your Bac

# +++++++++++ DJANGO +++++++++++
# To use your own django app use code like this:
import os
import sys

# assuming your django settings file is at '/home/Zipfile/mysite/mysite/settings.py'
# and your manage.py is is at '/home/Zipfile/mysite/manage.py'
path = '/home/Zipfile/repo_name'
if path not in sys.path:
    sys.path.append(path)


os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
#
## then:
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()



update the databse on
setting.py 


go to bash

python manage.py makemigrations
python manage.py migrate



