# -*- coding: utf-8 -*-
"""
Created on Wed May 23 20:49:26 2018

@author: 44219
"""

fp = 'D:/Texi/myapp/public/data/sevenDayData'
os.chdir(fp)

pathdir=os.listdir(fp)

for path in pathdir:
    thisFile=[]
    newdir = os.path.join(fp,path)
    if os.path.isfile(newdir):     
        with open (newdir,'r',encoding='utf-8') as f:
            tmp=0
            reader=csv.reader(f)
            tmp=0
            for line in islice(reader, 1, None): 
                
                time=line[1]
                
                day=int(time.split(' ')[0].split('/')[2])
                if(day<18 or day>24):
                    continue
                
                status=int(line[4])
                
                if(status!=0 and status!=1):
                    continue
                
                hour=time.split(' ')[1].split(':')[0]
                
                time = str(day)+'-'+str(int(hour))
                if(tmp!=status):
                    writeLine=[]
                    writeLine.append(time)
                    writeLine.append(line[2])
                    writeLine.append(line[3])
                    writeLine.append(line[4])
                    thisFile.append(writeLine)
                    tmp=status
    if(len(thisFile)!=0):
        with open("D:/Texi/myapp/public/data/sevenDayData/"+path,"w",encoding='utf-8',newline='') as csvfile: 
            writer = csv.writer(csvfile)
            #先写入columns_name
            writer.writerow(['time','jd','wd','status'])
            #写入多行用writerows
            writer.writerows(thisFile)