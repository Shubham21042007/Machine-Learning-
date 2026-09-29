import os, numpy as np, pandas as pd, joblib
import app
patient={'residence':1,'dm003':1,'dm005':55,'dm008':2,'dm021':1,'we027_main':5,'hb001':2,'hb101':2,'hb211':5,'hb213':5,'fs507':5,'bm017':145,'bm018':90,'bm019':75,'bm028':20,'bm029':20,'bm030':18,'bm031':18,'bm056':10,'bm057':10,'bm061':1,'bm062':1,'bm063':1,'bm064':1,'bm067':171,'bm071':75,'bm076':90,'bm079':100,'ht001_a':4,'ht212':2,'ht219':1,'ht220':1,'ht221':1,'ht222':1,'ht225':2,'ht229s1':0,'ht229s2':0,'ht229s3':0,'ht229s4':0,'ht229s5':0,'ht229s6':0,'ht229s7':0,'ht229s8':0,'ht229s9':0}
result = app.generate_shap_for_disease('glaucoma', patient)
print(result)
print('len features', len(result['features']))
