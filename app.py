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
import zlib
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
################################################
# Caching
################################################
cache=Cache()
cache_servers = os.environ.get('MEMCACHIER_SERVERS')
if cache_servers == None:
    cache.init_app(app, config={'CACHE_TYPE': 'simple'})
else:
    cache_user = os.environ.get('MEMCACHIER_USERNAME') or ''
    cache_pass = os.environ.get('MEMCACHIER_PASSWORD') or ''
    cache.init_app(app,
        config={'CACHE_TYPE': 'saslmemcached',
                'CACHE_MEMCACHED_SERVERS': cache_servers.split(','),
                'CACHE_MEMCACHED_USERNAME': cache_user,
                'CACHE_MEMCACHED_PASSWORD': cache_pass,
                'CACHE_OPTIONS': { 'behaviors': {
                    # Faster IO
                    'tcp_nodelay': True,
                    # Keep connection alive
                    'tcp_keepalive': True,
                    # Timeout for set/get requests
                    'connect_timeout': 2000, # ms
                    'send_timeout': 750 * 1000, # us
                    'receive_timeout': 750 * 1000, # us
                    '_poll_timeout': 2000, # ms
                    # Better failover
                    'ketama': True,
                    'remove_failed': 1,
                    'retry_timeout': 2,
                    'dead_timeout': 30}}
                    })
##############################################################
# Pull data from SQL datadase and turn it into JSON and cache
##############################################################
state_heatmap=cache.get('state_heatmap')
if state_heatmap==None:
    state_heatmap=pd.read_sql_query('select * from state_heatmap', con=engine1)
    state_heatmap=state_heatmap.to_json(orient='records')
    cache.set('state_heatmap',state_heatmap, timeout=5 * 60)

usa_heatmap=cache.get('usa_heatmap')
if usa_heatmap==None:
    usa_heatmap=pd.read_sql_query('select * from usa_heatmap', con=engine1)
    usa_heatmap=usa_heatmap.to_json(orient='records')
    cache.set('usa_heatmap',usa_heatmap, timeout=5 * 60)

county_heatmap=cache.get('county_heatmap')
if county_heatmap==None:
    county_heatmap=pd.read_sql_query('select * from county_heatmap', con=engine1)
    county_heatmap=county_heatmap.to_json(orient='records')
    # Fix Parsing error where python and javascript look at apostrophes in different ways
    county_heatmap=county_heatmap.replace("'",r"\'")
    cache.set('county_heatmap',county_heatmap, timeout=5 * 60)

orders=cache.get('orders')
if orders==None:
    orders=pd.read_sql_query('select * from orders', con=engine1)
    orders=orders.to_json(orient='records')
    cache.set('orders',orders, timeout=5 * 60)

state_cases=cache.get('state_cases')
if state_cases==None:
    state_cases=pd.read_sql_query('select * from state_cases', con=engine1)
    state_cases=state_cases.to_json(orient='records')
    cache.set('state_cases',state_cases, timeout=5 * 60)

state_deaths=cache.get('state_deaths')
if state_deaths==None:
    state_deaths=pd.read_sql_query('select * from state_deaths', con=engine1)
    state_deaths=state_deaths.to_json(orient='records')
    cache.set('state_deaths',state_deaths, timeout=5 * 60)

compressed_county_cases=cache.get('compressed_county_cases')
if compressed_county_cases==None:
    county_cases=pd.read_sql_query('select * from county_cases', con=engine1).head(2000)
    county_cases=county_cases.to_json(orient='records')
    # Fix Parsing error where python and javascript look at apostrophes in different ways
    county_cases=county_cases.replace("'",r"\'")
    compressed_county_cases=zlib.compress(county_cases)
    cache.set('compressed_county_cases',compressed_county_cases, timeout=5 * 60)
else:
    county_cases=zlib.decompress(compressed_county_cases)

compressed_county_deaths=cache.get('compressed_county_deaths')
if compressed_county_deaths==None:
    county_deaths=pd.read_sql_query('select * from county_deaths', con=engine1).head(2000)
    county_deaths=county_deaths.to_json(orient='records')
    # Fix Parsing error where python and javascript look at apostrophes in different ways
    county_deaths=county_deaths.replace("'",r"\'")
    compressed_county_deaths=zlib.compress(county_deaths)
    cache.set('compressed_county_deaths',compressed_county_deaths, timeout=5 * 60)
else:
    county_deaths=zlib.decompress(compressed_county_deaths)

# create route that renders html templates
@app.route("/")
def home():
    return render_template("index.html", state_heatmap=state_heatmap, usa_heatmap=usa_heatmap, county_heatmap=county_heatmap, API_KEY=API_KEY)

@app.route("/plots")
def plots():
    return render_template("plots.html", orders=orders, state_cases=state_cases, state_deaths=state_deaths, county_cases=county_cases, county_deaths=county_deaths)

@app.route("/methodology")
def methodology():
    return render_template("methodology.html")

@app.route("/aboutus")
def aboutus():
    return render_template("aboutus.html")

if __name__ == "__main__":
    app.run(debug=False)