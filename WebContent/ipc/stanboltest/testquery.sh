site=$1
cmd='curl -X POST -F "query=@srfgquery.json" http://'$site':8080/entityhub/site/srfg/query?'
echo $cmd
$cmd
