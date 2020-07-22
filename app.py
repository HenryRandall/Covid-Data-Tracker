# import necessary libraries
import os
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)
from flask_caching import Cache
import sqlalchemy
import sqlalchemy
from sqlalchemy import create_engine, func, inspect, desc
import pandas as pd
import json
#################################################
# Flask Setup
#################################################
app = Flask(__name__)
#################################################
# Import Enviornment Variables
#################################################
username1 = os.environ['username1']
password1 = os.environ['password1']
host1 = os.environ['host1']
port1 = os.environ['port1']
database1 = os.environ['database1']
# username2 = os.environ['username2']
# password2 = os.environ['password2']
# host2 = os.environ['host2']
# port2 = os.environ['port2']
# database2 = os.environ['database2']
API_KEY = os.environ['API_KEY']
#################################################
# Database Setup
#################################################
connection1=f'{username1}:{password1}@{host1}:{port1}/{database1}'
engine1 = create_engine(f'postgresql://{connection1}')
# connection2=f'{username2}:{password2}@{host2}:{port2}/{database2}'
# engine2 = create_engine(f'postgresql://{connection2}')



#################################################
# Caching
#################################################
# cache=Cache()
# # app.config['CACHE_TYPE']='memcached'
# # cache.init_app(app)

# cache_servers = os.environ.get('MEMCACHIER_SERVERS')
# if cache_servers == None:
#     cache.init_app(app, config={'CACHE_TYPE': 'simple'})
# else:
#     cache_user = os.environ.get('MEMCACHIER_USERNAME') or ''
#     cache_pass = os.environ.get('MEMCACHIER_PASSWORD') or ''
#     cache.init_app(app,
#         config={'CACHE_TYPE': 'saslmemcached',
#                 'CACHE_MEMCACHED_SERVERS': cache_servers.split(','),
#                 'CACHE_MEMCACHED_USERNAME': cache_user,
#                 'CACHE_MEMCACHED_PASSWORD': cache_pass,
#                 'CACHE_OPTIONS': { 'behaviors': {
#                     # Faster IO
#                     'tcp_nodelay': True,
#                     # Keep connection alive
#                     'tcp_keepalive': True,
#                     # Timeout for set/get requests
#                     'connect_timeout': 2000, # ms
#                     'send_timeout': 750 * 1000, # us
#                     'receive_timeout': 750 * 1000, # us
#                     '_poll_timeout': 2000, # ms
#                     # Better failover
#                     'ketama': True,
#                     'remove_failed': 1,
#                     'retry_timeout': 2,
#                     'dead_timeout': 30}}
#                     })


# create route that renders index.html template
@app.route("/", methods=('GET','POST'))
def home():
    # Pull data from SQL datadase and turn it into JSON
    
    state_heatmap=pd.read_sql_query('select * from state_heatmap', con=engine1)
    state_heatmap=state_heatmap.to_json(orient='records')
    cache.set('state_heatmap',state_heatmap, timeout=5 * 60)

    usa_heatmap=pd.read_sql_query('select * from usa_heatmap', con=engine1)
    usa_heatmap=usa_heatmap.to_json(orient='records')
    cache.set('usa_heatmap',usa_heatmap, timeout=5 * 60)

    county_heatmap=pd.read_sql_query('select * from county_heatmap', con=engine1)
    county_heatmap=county_heatmap.to_json(orient='records')
    # Fix Parsing error where python and javascript look at apostrophes in different ways
    county_heatmap=county_heatmap.replace("'",r"\'")
    cache.set('county_heatmap',county_heatmap, timeout=5 * 60)

    return render_template("index.html", state_heatmap=state_heatmap, usa_heatmap=usa_heatmap, county_heatmap=county_heatmap, API_KEY=API_KEY)

@app.route("/plots")
# @cache.cached()
def plots():
    # Pull data from SQL datadase and turn it into JSON
    orders=pd.read_sql_query('select * from orders', con=engine1)
    orders=orders.to_json(orient='records')
    state_cases=pd.read_sql_query('select * from state_cases', con=engine1)
    state_cases=state_cases.to_json(orient='records')
    state_deaths=pd.read_sql_query('select * from state_deaths', con=engine1)
    state_deaths=state_deaths.to_json(orient='records')
    county_cases=pd.read_sql_query('select * from county_cases', con=engine1)
    county_cases=county_cases.to_json(orient='records')
    # Fix Parsing error where python and javascript look at apostrophes in different ways
    county_cases=county_cases.replace("'",r"\'")
    county_deaths=pd.read_sql_query('select * from county_deaths', con=engine1)
    county_deaths=county_deaths.to_json(orient='records')
    # Fix Parsing error where python and javascript look at apostrophes in different ways
    county_deaths=county_deaths.replace("'",r"\'")
    return render_template("plots.html", orders=orders, state_cases=state_cases, state_deaths=state_deaths, county_cases=county_cases, county_deaths=county_deaths)

@app.route("/methodology")
def methodology():
    return render_template("methodology.html")

@app.route("/aboutus")
def aboutus():
    return render_template("aboutus.html")

if __name__ == "__main__":
    app.run(debug=False)
