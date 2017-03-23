PACKAGES <- c("ggplot2","dplyr","knitr","data.table","stringr","xtable","scales","xlsx","httr","RCurl","XML",'plyr',"bit64","jsonlite","plotly")
sapply(PACKAGES, require, character.only=T)


wosp<-GET("http://www.wosp.org.pl/final/historia-finalow")

wosp<-htmlParse(wosp,encoding="utf-8")
  
wospList<-getNodeSet(wosp,"//strong")

i=1

for(i in 1:length(wospList)){
  
  if(i==11){wospDane<-rbind(wospDane,data.table("final"="6. Finał WOŚP - 4 stycznia 1998 r","i"=i,"kwota1"=xmlValue(wospList[[i]]),"kwota2"=xmlValue(wospList[[i+2]])))}
  if(i==32){wospDane<-rbind(wospDane,data.table("final"="17. Finał WOŚP - 11 stycznia 2009 r.","i"=i,"kwota1"="11 011 771,01 USD","kwota2"=xmlValue(wospList[[i+2]])))}
  
  if(grepl("Fina",xmlValue(wospList[[i]]))){
    
    
    ifelse(i==1,
           wospDane<-data.table("final"=xmlValue(wospList[[i]]),"i"=i,"kwota1"=xmlValue(wospList[[i+1]]),"kwota2"=xmlValue(wospList[[i+2]])),
           wospDane<-rbind(wospDane,data.table("final"=xmlValue(wospList[[i]]),"i"=i,"kwota1"=xmlValue(wospList[[i+1]]),"kwota2"=xmlValue(wospList[[i+2]]))))
    }
}

wospDane[,data:=substr(final,nchar(final)-18,nchar(final))]

wospDane[,i:=NULL]
           
# some fixes
wospDane[6,data:="4 stycznia 1998 r."]
wospDane[21,data:="13 stycznia 2013 r."]
wospDane[22,data:="12 stycznia 2014 r."]
wospDane[25,data:="15 stycznia 2017 r."]

wospDane[1:19,kwota2:=""]
wospDane[20,kwota1:="40 269 194,76 PLN"]
wospDane[20,kwota2:="50 638 801,30 PLN"]

# currency and number convertion
wospDane[,waluta:=substr(kwota1,nchar(kwota1)-3,nchar(kwota1))]
wospDane[,kwota1:=gsub("Kwota zebrana: ","",kwota1)]
wospDane[,kwota1:=gsub("Kwota zebrana - ","",kwota1)]
wospDane[,kwota1:=gsub("- ","",kwota1)]
wospDane[,kwota1:=gsub(" USD","",kwota1)]
wospDane[,kwota1:=gsub(" PLN","",kwota1)]
wospDane[,kwota2:=gsub(" PLN!","",kwota2)]
wospDane[,kwota2:=gsub(" PLN","",kwota2,fixed=T)]

wospDane[,kwota1:=gsub(",",".",kwota1)]
wospDane[,kwota2:=gsub(",",".",kwota2)]

# date
wospDane[,kwota1:=as.numeric(gsub(" ","",kwota1))]
wospDane[,kwota2:=as.numeric(gsub(" ","",kwota2))]
wospDane[25,kwota2:=105570801.49]
wospDane[,data:=gsub(" stycznia ","-01-",data)]
wospDane[,data:=gsub(" r.","",data)]
wospDane[,data:=as.Date(data,format="%d-%m-%Y")]

# ex rate
# http://www.nbp.pl/home.aspx?f=/kursy/arch_a.html Kursy średnie walut obcych

kursy<-data.table(data=as.Date(c("1993-01-03","1994-01-02","1995-01-08","1996-01-07","1997-01-05","1998-01-04",
                         "1999-01-10","2000-01-09","2001-01-07","2002-01-13","2003-01-12","2004-01-11",
                         "2005-01-09","2006-01-08","2007-01-14","2008-01-13","2009-01-11","2010-01-10")),
                  kurs=c(15777,21412,24385,24830,28800,35275,
                         34880,40620,40991,40116,38086,36456,
                         31091,31228,29918,24055,30183,27983))

wospDane<-merge(wospDane,kursy,by="data",all.x=T)

wospDane[,kurs:=kurs/10000]

ggplot(wospDane,aes(data,kurs))+geom_line()+theme_bw()

wospDane[,zadeklarowano:=kwota1]
wospDane[waluta==" USD",zadeklarowano:=NA]

wospDane[,zebrano:=kwota2]
wospDane[data=="2011-01-09",zebrano:=kwota1]
wospDane[waluta==" USD",zebrano:=kwota1*kurs]

g<-ggplot(wospDane,aes(data,zebrano/1e3,col=waluta))+geom_line()+theme_bw()+geom_line(aes(data,kwota1/1e3,col="USD nie przeliczone"),data=wospDane[waluta==" USD"])+scale_y_continuous(label=comma)+
  labs(title="Zebrane kwoty przez WOŚP",y="Kwota zebrana (w tys. zł)",x="Data",caption = "Source:http://www.wosp.org.pl/final/historia-finalow")
ggplotly(g)

wospDane[,wzrost:=shift(zebrano,1)]
wospDane[,wzrost_proc:=(zebrano-wzrost)/wzrost]
wospDane[,wzrost:=zebrano-wzrost]
wospDane[,Rok:=year(data)]
wospDane[is.na(wzrost),wzrost:=0]
wospDane[is.na(wzrost_proc),wzrost_proc:=0]

sink(file="WOSP_results.json")
toJSON(wospDane)
sink()

ggplot(wospDane,aes(data,wzrost/1e3))+geom_bar(stat="identity")+theme_bw()+scale_y_continuous(label=comma)
g<-ggplot(wospDane,aes(data,wzrost/1e3))+geom_bar(stat="identity")+theme_bw()+scale_y_continuous(label=comma)+
  labs(title="Zebrane kwoty przez WOŚP",y="Zmiana (w tys. zł)",x="Data",caption = "Source:http://www.wosp.org.pl/final/historia-finalow")
ggplotly(g)
