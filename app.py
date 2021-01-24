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
API_KEY = os.environ['API_KEY']
#################################################
# Database Setup
#################################################
connection1=f'{username1}:{password1}@{host1}:{port1}/{database1}'
engine1 = create_engine(f'postgresql://{connection1}')
################################################
# Caching Setting
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
                'CACHE_DEFAULT_TIMEOUT': 922337203685477580,
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

# create route that renders html templates
@app.route("/")
def home():
    ##############################################################
    # Pull data from SQL datadase and turn it into JSON and cache
    ##############################################################
    
    # Check and see if it is chaches already
    state_heatmap=cache.get('state_heatmap')
    if state_heatmap==None:
        # Pull from Sql and chache if not there
        state_heatmap=pd.read_sql_query('select * from state_heatmap', con=engine1)
        state_heatmap=state_heatmap.to_json(orient='records')
        cache.set('state_heatmap',state_heatmap, timeout=922337203685477580)

    # Check and see if it is chaches already
    usa_heatmap=cache.get('usa_heatmap')
    if usa_heatmap==None:
        # Pull from Sql and chache if not there
        usa_heatmap=pd.read_sql_query('select * from usa_heatmap', con=engine1)
        usa_heatmap=usa_heatmap.to_json(orient='records')
        cache.set('usa_heatmap',usa_heatmap, timeout=922337203685477580)

    # Check and see if it is chaches already
    county_heatmap=cache.get('county_heatmap')
    if county_heatmap==None:
        # Pull from Sql and chache if not there
        county_heatmap=pd.read_sql_query('select * from county_heatmap', con=engine1)
        county_heatmap=county_heatmap.to_json(orient='records')
        # Fix Parsing error where python and javascript look at apostrophes in different ways
        county_heatmap=county_heatmap.replace("'",r"\'")
        cache.set('county_heatmap',county_heatmap, timeout=922337203685477580)

    return render_template("index.html", state_heatmap=state_heatmap, usa_heatmap=usa_heatmap, county_heatmap=county_heatmap, API_KEY=API_KEY)

@app.route("/plots")
def plots():
    ##############################################################
    # Pull data from SQL datadase and turn it into JSON and cache
    ##############################################################

    # Check and see if it is chaches already
    orders=cache.get('orders')
    if orders==None:
        # Pull from Sql and chache if not there
        orders=pd.read_sql_query('select * from orders', con=engine1)
        orders=orders.to_json(orient='records')
        cache.set('orders',orders, timeout=922337203685477580)

    # Check and see if it is chaches already
    state_cases=cache.get('state_cases')
    if state_cases==None:
        # Pull from Sql and chache if not there
        state_cases=pd.read_sql_query('select * from state_cases', con=engine1)
        state_cases=state_cases.to_json(orient='records')
        cache.set('state_cases',state_cases, timeout=922337203685477580)

    # Check and see if it is chaches already
    state_deaths=cache.get('state_deaths')
    if state_deaths==None:
        # Pull from Sql and chache if not there
        state_deaths=pd.read_sql_query('select * from state_deaths', con=engine1)
        state_deaths=state_deaths.to_json(orient='records')
        cache.set('state_deaths',state_deaths, timeout=922337203685477580)

    # Check and see if it is chaches already
    usa_heatmap=cache.get('usa_heatmap')
    if usa_heatmap==None:
        # Pull from Sql and chache if not there
        usa_heatmap=pd.read_sql_query('select * from usa_heatmap', con=engine1)
        usa_heatmap=usa_heatmap.to_json(orient='records')
        cache.set('usa_heatmap',usa_heatmap, timeout=922337203685477580)

    # Check and see if it is chaches already
    compressed_county_cases1=cache.get('compressed_county_cases1')
    if compressed_county_cases1==None:
        # Pull from Sql and chache if not there
        county_cases1=pd.read_sql_query('select * from county_cases1', con=engine1)
        county_cases1=county_cases1.to_json(orient='records')
        # Fix Parsing error where python and javascript look at apostrophes in different ways
        county_cases1=county_cases1.replace("'",r"\'")
        # Run compression to fall under the size limit
        compressed_county_cases1=zlib.compress(county_cases1.encode('utf8'), level=9)
        cache.set('compressed_county_cases1',compressed_county_cases1, timeout=922337203685477580)
    else:
        county_cases1=zlib.decompress(compressed_county_cases1).decode('utf8')

    # Check and see if it is chaches already
    compressed_county_cases2=cache.get('compressed_county_cases2')
    if compressed_county_cases2==None:
        # Pull from Sql and chache if not there
        county_cases2=pd.read_sql_query('select * from county_cases2', con=engine1)
        county_cases2=county_cases2.to_json(orient='records')
        # Fix Parsing error where python and javascript look at apostrophes in different ways
        county_cases2=county_cases2.replace("'",r"\'")
        # Run compression to fall under the size limit
        compressed_county_cases2=zlib.compress(county_cases2.encode('utf8'), level=9)
        cache.set('compressed_county_cases2',compressed_county_cases2, timeout=922337203685477580)
    else:
        county_cases2=zlib.decompress(compressed_county_cases2).decode('utf8')

    # Check and see if it is chaches already
    compressed_county_cases3=cache.get('compressed_county_cases3')
    if compressed_county_cases3==None:
        # Pull from Sql and chache if not there
        county_cases3=pd.read_sql_query('select * from county_cases3', con=engine1)
        county_cases3=county_cases3.to_json(orient='records')
        # Fix Parsing error where python and javascript look at apostrophes in different ways
        county_cases3=county_cases3.replace("'",r"\'")
        # Run compression to fall under the size limit
        compressed_county_cases3=zlib.compress(county_cases3.encode('utf8'), level=9)
        cache.set('compressed_county_cases3',compressed_county_cases3, timeout=922337203685477580)
    else:
        county_cases3=zlib.decompress(compressed_county_cases3).decode('utf8')


    # Check and see if it is chaches already
    compressed_county_cases4=cache.get('compressed_county_cases4')
    if compressed_county_cases4==None:
        # Pull from Sql and chache if not there
        county_cases4=pd.read_sql_query('select * from county_cases4', con=engine1)
        county_cases4=county_cases4.to_json(orient='records')
        # Fix Parsing error where python and javascript look at apostrophes in different ways
        county_cases4=county_cases4.replace("'",r"\'")
        # Run compression to fall under the size limit
        compressed_county_cases4=zlib.compress(county_cases4.encode('utf8'), level=9)
        cache.set('compressed_county_cases4',compressed_county_cases4, timeout=922337203685477580)
    else:
        county_cases4=zlib.decompress(compressed_county_cases4).decode('utf8')


    # Check and see if it is chaches already
    compressed_county_cases5=cache.get('compressed_county_cases5')
    if compressed_county_cases5==None:
        # Pull from Sql and chache if not there
        county_cases5=pd.read_sql_query('select * from county_cases5', con=engine1)
        county_cases5=county_cases5.to_json(orient='records')
        # Fix Parsing error where python and javascript look at apostrophes in different ways
        county_cases5=county_cases3.replace("'",r"\'")
        # Run compression to fall under the size limit
        compressed_county_cases5=zlib.compress(county_cases5.encode('utf8'), level=9)
        cache.set('compressed_county_cases5',compressed_county_cases5, timeout=922337203685477580)
    else:
        county_cases5=zlib.decompress(compressed_county_cases5).decode('utf8')


    # Check and see if it is chaches already
    compressed_county_deaths1=cache.get('compressed_county_deaths1')
    if compressed_county_deaths1==None:
        # Pull from Sql and chache if not there
        county_deaths1=pd.read_sql_query('select * from county_deaths1', con=engine1)
        county_deaths1=county_deaths1.to_json(orient='records')
        # Fix Parsing error where python and javascript look at apostrophes in different ways
        county_deaths1=county_deaths1.replace("'",r"\'")
        # Run compression to fall under the size limit
        compressed_county_deaths1=zlib.compress(county_deaths1.encode('utf8'), level=9)
        cache.set('compressed_county_deaths1',compressed_county_deaths1, timeout=922337203685477580)
    else:
        county_deaths1=zlib.decompress(compressed_county_deaths1).decode('utf8')

    # Check and see if it is chaches already
    compressed_county_deaths2=cache.get('compressed_county_deaths2')
    if compressed_county_deaths2==None:
        # Pull from Sql and chache if not there
        county_deaths2=pd.read_sql_query('select * from county_deaths2', con=engine1)
        county_deaths2=county_deaths2.to_json(orient='records')
        # Fix Parsing error where python and javascript look at apostrophes in different ways
        county_deaths2=county_deaths2.replace("'",r"\'")
        # Run compression to fall under the size limit
        compressed_county_deaths2=zlib.compress(county_deaths2.encode('utf8'), level=9)
        cache.set('compressed_county_deaths2',compressed_county_deaths2, timeout=922337203685477580)
    else:
        county_deaths2=zlib.decompress(compressed_county_deaths2).decode('utf8')

    # Check and see if it is chaches already
    compressed_county_deaths3=cache.get('compressed_county_deaths3')
    if compressed_county_deaths3==None:
        # Pull from Sql and chache if not there
        county_deaths3=pd.read_sql_query('select * from county_deaths3', con=engine1)
        county_deaths3=county_deaths3.to_json(orient='records')
        # Fix Parsing error where python and javascript look at apostrophes in different ways
        county_deaths3=county_deaths3.replace("'",r"\'")
        # Run compression to fall under the size limit
        compressed_county_deaths3=zlib.compress(county_deaths3.encode('utf8'), level=9)
        cache.set('compressed_county_deaths3',compressed_county_deaths3, timeout=922337203685477580)
    else:
        county_deaths3=zlib.decompress(compressed_county_deaths3).decode('utf8')

    # Check and see if it is chaches already
    compressed_county_deaths4=cache.get('compressed_county_deaths4')
    if compressed_county_deaths4==None:
        # Pull from Sql and chache if not there
        county_deaths4=pd.read_sql_query('select * from county_deaths4', con=engine1)
        county_deaths4=county_deaths4.to_json(orient='records')
        # Fix Parsing error where python and javascript look at apostrophes in different ways
        county_deaths4=county_deaths4.replace("'",r"\'")
        # Run compression to fall under the size limit
        compressed_county_deaths4=zlib.compress(county_deaths4.encode('utf8'), level=9)
        cache.set('compressed_county_deaths4',compressed_county_deaths4, timeout=922337203685477580)
    else:
        county_deaths4=zlib.decompress(compressed_county_deaths4).decode('utf8')

    # Check and see if it is chaches already
    compressed_county_deaths5=cache.get('compressed_county_deaths5')
    if compressed_county_deaths5==None:
        # Pull from Sql and chache if not there
        county_deaths5=pd.read_sql_query('select * from county_deaths5', con=engine1)
        county_deaths5=county_deaths5.to_json(orient='records')
        # Fix Parsing error where python and javascript look at apostrophes in different ways
        county_deaths5=county_deaths5.replace("'",r"\'")
        # Run compression to fall under the size limit
        compressed_county_deaths5=zlib.compress(county_deaths5.encode('utf8'), level=9)
        cache.set('compressed_county_deaths5',compressed_county_deaths5, timeout=922337203685477580)
    else:
        county_deaths5=zlib.decompress(compressed_county_deaths5).decode('utf8')

    # Merge split files
    county_cases=county_cases1+county_cases2+county_cases3+county_cases4+county_cases5
    county_cases=county_cases.replace("][",r",")
    county_deaths=county_deaths1+county_deaths2+county_deaths3+county_deaths4+county_deaths5
    county_deaths=county_deaths.replace("][",r",")
    return render_template("plots.html", orders=orders, state_cases=state_cases, state_deaths=state_deaths, usa_heatmap=usa_heatmap, county_cases=county_cases, county_deaths=county_deaths)

@app.route("/methodology")
def methodology():
    return render_template("methodology.html")

@app.route("/aboutus")
def aboutus():
    return render_template("aboutus.html")

if __name__ == "__main__":
    app.run(debug=False)