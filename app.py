# import necessary libraries
import os
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)
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
# Database Setup
#################################################
username1 = os.environ['username1']
password1 = os.environ['password1']
host1 = os.environ['host1']
port1 = os.environ['port1']
database1 = os.environ['database1']
username2 = os.environ['username2']
password2 = os.environ['password2']
host2 = os.environ['host2']
port2 = os.environ['port2']
database2 = os.environ['databas2']
API_KEY = os.environ['API_KEY']
connection1=f'{username1}:{password1}@{host1}:{port1}/{database1}'
engine1 = create_engine(f'postgresql://{connection1}')
connection2=f'{username2}:{password2}@{host2}:{port2}/{database2}'
engine2 = create_engine(f'postgresql://{connection1}')

# create route that renders index.html template
@app.route("/")
def home():
    state_heatmap=pd.read_sql_query('select * from state_heatmap', con=engine1)
    state_heatmap=state_heatmap.to_json(orient='records')
    usa_heatmap=pd.read_sql_query('select * from usa_heatmap', con=engine1)
    usa_heatmap=usa_heatmap.to_json(orient='records')
    county_heatmap=pd.read_sql_query('select * from county_heatmap', con=engine1)
    county_heatmap=county_heatmap.to_json(orient='records')
    county_heatmap=county_heatmap.replace("'",r"\'")
    return render_template("index.html", state_heatmap=state_heatmap, usa_heatmap=usa_heatmap, county_heatmap=county_heatmap, API_KEY=API_KEY)

@app.route("/plots")
def plots():
    state_cases=pd.read_sql_query('select * from state_cases', con=engine1)
    state_cases=state_cases.to_json(orient='records')
    state_deaths=pd.read_sql_query('select * from state_deaths', con=engine1)
    state_deaths=state_deaths.to_json(orient='records')
    state_cases_daily=pd.read_sql_query('select * from state_cases_daily', con=engine1)
    state_cases_daily=state_cases_daily.to_json(orient='records')
    state_deaths_daily=pd.read_sql_query('select * from state_deaths_daily', con=engine1)
    state_deaths_daily=state_deaths_daily.to_json(orient='records')
    county_cases=pd.read_sql_query('select * from county_cases', con=engine1)
    county_cases=county_cases.to_json(orient='records')
    county_cases=county_cases.replace("'",r"\'")
    county_deaths=pd.read_sql_query('select * from county_deaths', con=engine1)
    county_deaths=county_deaths.to_json(orient='records')
    county_deaths=county_deaths.replace("'",r"\'")
    county_cases_daily=pd.read_sql_query('select * from county_cases_daily', con=engine12
    county_cases_daily=county_cases_daily.to_json(orient='records')
    county_cases_daily=county_cases_daily.replace("'",r"\'")
    county_deaths_daily=pd.read_sql_query('select * from county_deaths_daily', con=engine2)
    county_deaths_daily=county_deaths_daily.to_json(orient='records')
    county_deaths_daily=county_deaths_daily.replace("'",r"\'")
    return render_template("plots.html")

if __name__ == "__main__":
    app.run(debug=True)
