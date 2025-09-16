1. api.py -> views.py
2. docker-compose.override set up
3*. DRF spectacular for openAPI docs
4. OpenAPI.yml for documentation  
5. docker-compose duplicate cmd, for runserver
Reqs
6. Python 3.11 update (matchcase), look into 3.13
7. Django 5.#
8. pep 8 code formatting
9. https://stackoverflow.com/questions/24629705/django-using-get-user-model-vs-settings-auth-user-model get_user_model example
10. pydantic, typedict
11. @property, @staticmethod, @classmethod, etc.
12. admin.ModelAdmin advanced usage
13. urls.py for each app
14. class VehicleSerializer(serializers.ModelSerializer): advanced usage
15. utils.py, services.py - app files
16. Poetry.toml
17. rest framework paginator
18. Do not use lists like STATUS_CHOICES or VEHICLE_CATEGORIES, use enums, be more advanced
https://pyjwt.readthedocs.io/en/stable/ for JWT docs and easy integration
openAPI swagger for Django
fastAPI docs like documentation
Django using get_user_model vs settings.AUTH_USER_MODEL
Asked 11 years, 2 months ago
Modified 6 months ago
Viewed 130k times
162

Reading the Django Documentation:

get_user_model()

Instead of referring to User directly, you should reference the user model using django.contrib.auth.get_user_model(). This method will return the currently active User model – the custom User model if one is specified, or User otherwise.

When you define a foreign key or many-to-many relations to the User model, you should specify the custom model using the AUTH_USER_MODEL setting.

I'm confused with the above text. Should I be doing this:

author = models.ForeignKey(settings.AUTH_USER_MODEL)
or this...

author = models.ForeignKey(get_user_model())
Both seem to work.
Since Django 1.11 you can use get_user_model() in both cases! So if you don't want to bother about it further, just take it.

"in both cases" means: if you need the user model for accessing its attributes, as well as if you want to define a ForeignKey/ManyToMany-relation.

From the changelog:

get_user_model() can now be called at import time, even in modules that define models.

so... is there still a reason to use settings.AUTH_USER_MODEL? Well, the docs still recommend the settings.AUTH_USER_MODEL (which is a string) for defining relations, but without giving an explicit reason. Might be beneficial for performance, but doesn't seem to matter much.

Code example:
from django.db import models
from django.contrib.auth import get_user_model
...
    ...
    user = models.ForeignKey(
        get_user_model(),
        null=True, # explicitly set null, since it's required in django 2.x. - otherwise migrations will be incompatible later!
        ...
    )
Share
Improve this answer
Follow
edited Oct 22, 2019 at 16:42
answered Mar 3, 2018 at 20:38
Ilja's user avatar
Ilja
2,1241515 silver badges2929 bronze badges
2
Thanks for pointing out that get_user_model() can be called at import time; however, Django still advises that users define foreign-key and many-to-many relations using AUTH_USER_MODEL – 
kevins
 CommentedApr 24, 2019 at 8:44
3
thank you for pointing out this recommendation, somehow I overlooked it when writing the reply, but now I found it. I tried to integrate this into the answer (still favouring get_user_model, especially for readers who are confused about the distinction) – 
Ilja
 CommentedMay 28, 2019 at 13:04

Since Django 1.11, get_user_model() actually uses settings.AUTH_USER_MODEL:

def get_user_model():
    """
    Return the User model that is active in this project.
    """
    try:
        return django_apps.get_model(settings.AUTH_USER_MODEL, require_ready=False)
    except ValueError:
        raise ImproperlyConfigured("AUTH_USER_MODEL must be of the form 'app_label.model_name'")
    except LookupError:
        raise ImproperlyConfigured(
            "AUTH_USER_MODEL refers to model '%s' that has not been installed" % settings.AUTH_USER_MODEL
        )
Notițe de la Sesiunea Tehnică cu Nikita
Subiect: Bune practici și direcții de îmbunătățire pentru proiectul nostru. Scop: Să implementăm aceste recomandări pentru a construi o aplicație mai robustă, mai modernă și mai ușor de întreținut.
I. Structura Proiectului și Bune Practici
Recomandări despre cum să ne organizăm mai bine codul în Django.
1. urls.py pentru Fiecare Aplicație
Observație: Proiectul principal (project/urls.py) nu ar trebui să conțină toate rutele.
Recomandare: Fiecare aplicație (users, school) trebuie să aibă propriul său fișier urls.py. Proiectul principal va folosi include() pentru a delega rutarea către aplicațiile corespunzătoare.
De ce? Acest lucru face aplicațiile noastre modulare și reutilizabile. Menține fișierul principal de URL-uri curat și organizat.

2. Redenumirea api.py în views.py
Observație: Django, prin convenție, folosește views.py pentru logica de request/response.
Recomandare: Să respectăm convenția și să folosim views.py. Dacă dorim o separare mai clară, putem crea un folder api/ în interiorul aplicației, care să conțină fișiere specifice pentru API (ex: views.py, serializers.py).
3. Folosirea services.py și utils.py
Observație: Logica complexă nu ar trebui să stea în views.py.
Recomandare:
services.py: Pentru logica de business complexă (ex: o funcție enroll_student_in_course() care creează înscrierea, generează o plată inițială și trimite un email).
utils.py: Pentru funcții ajutătoare, generice și reutilizabile (ex: o funcție care generează un cod unic).
De ce? Păstrează views.py "subțire" și focusat doar pe gestionarea cererilor HTTP, făcând codul mult mai curat și mai ușor de testat.
II. Mediu de Dezvoltare și Unelte (Tooling)
Îmbunătățiri pentru mediul nostru de lucru local și pentru managementul proiectului.
1. Folosirea docker-compose.override.yml
Observație: docker-compose.yml conține comenzi specifice pentru dezvoltare.
Recomandare: Să creăm un fișier docker-compose.override.yml (care este ignorat de Git) pentru setările locale. Aici vom pune maparea volumelor pentru live-reloading și comanda runserver. Fișierul principal docker-compose.yml va conține configurația de bază, curată.
2. Documentație API Automatizată (DRF Spectacular)
Observație: Nu avem o metodă clară de a documenta API-ul.
Recomandare: Să integrăm drf-spectacular. Această unealtă generează automat o documentație interactivă (Swagger UI) direct din codul nostru (din serializatoare și view-uri).
De ce? Este esențial pentru echipa de frontend, care va avea mereu o documentație actualizată a API-ului. De asemenea, ne ajută să proiectăm API-uri mai bune.
3. Managementul Dependențelor cu Poetry
Observație: Folosim requirements.txt, care este un sistem mai vechi.
Recomandare: Să explorăm poetry ca o alternativă modernă. Acesta gestionează mai bine dependențele și mediile virtuale. (Aceasta este o recomandare pe termen lung).
III. Calitatea Codului și Modernizarea Tehnologiilor
Recomandări pentru a scrie cod mai bun și a folosi versiuni actuale ale uneltelor.
1. Actualizarea Versiunilor (Python & Django)
Recomandare: Să facem un plan de a trece la Python 3.11+ și Django 5.x.
De ce? Beneficiem de îmbunătățiri de performanță, patch-uri de securitate și funcționalități noi (ex: match/case în Python, care poate simplifica anumite logici).
2. Formatarea Codului cu PEP 8
Observație: Codul nu are un stil consistent.
Recomandare: Să adoptăm un formatator de cod automat precum black sau autopep8. Acesta va reformata automat codul pentru a respecta standardul PEP 8 la fiecare salvare.
De ce? Elimină discuțiile despre stil, face codul mai lizibil și mai profesionist.
3. get_user_model() vs settings.AUTH_USER_MODEL
Recomandare:
În models.py, când definim o relație ForeignKey cu modelul de utilizator, folosim string-ul: settings.AUTH_USER_MODEL.
În orice alt loc (views, services, admin), când avem nevoie de clasa User, o importăm cu: from django.contrib.auth import get_user_model; User = get_user_model().
De ce? Este o practică ce face codul mai robust și decuplat de implementarea specifică a modelului de utilizator.
4. Validarea Datelor cu Pydantic sau TypedDict
Recomandare: Pentru validarea datelor care intră în API (JSON-ul din cererile POST/PUT), să explorăm folosirea Pydantic sau a TypedDict din Python.
De ce? Aceste unelte oferă o validare a tipurilor de date mult mai strictă și mai clară decât dicționarele simple, reducând bug-urile.
5. Folosirea Decoratorilor Python
Recomandare: Să folosim corect decoratorii de clasă:
@property: Pentru a accesa o metodă ca pe un atribut (ex: o metodă full_name pe modelul User).
@classmethod: Pentru a crea metode "factory" care operează pe clasă, nu pe o instanță (ex: User.create_student(...)).
@staticmethod: Pentru funcții utilitare care logic aparțin unei clase, dar nu au nevoie de self sau cls.
IV. Îmbunătățiri pentru Django REST Framework (DRF)
Recomandări specifice pentru a ne îmbunătăți API-ul.
1. Utilizarea Avansată a Serializatoarelor
Recomandare: Serializatoarele pot face mult mai mult decât o simplă conversie. Putem defini câmpuri read_only, write_only, validări la nivel de câmp sau la nivel de obiect și putem gestiona relații imbricate.
Exemplu:
class VehicleSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Vehicle
        fields = ['id', 'make', 'model', 'license_plate', 'category', 'category_name']
        extra_kwargs = {'category': {'write_only': True}}



