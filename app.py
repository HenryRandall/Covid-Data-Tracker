# import necessary libraries
import os
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)
import sqlalchemy
from boto.s3.connection import S3Connection
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
username1 = S3Connection(os.environ['username1'])
password1 = S3Connection(os.environ['password1'])
host1 = S3Connection(os.environ['host1'])
port1 = S3Connection(os.environ['port1'])
database1 = S3Connection(os.environ['database1'])
connection1=f'{username1}:{password1}@{host1}:{port1}/{database1}'
engine1 = create_engine(f'postgresql://{connection1}')

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
    return render_template("index.html", state_heatmap=state_heatmap, usa_heatmap=usa_heatmap, county_heatmap=county_heatmap)

@app.route("/plots")
def plots():
    
    return render_template("plots.html")

if __name__ == "__main__":
    app.run(debug=True)
