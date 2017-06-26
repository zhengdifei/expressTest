T_BASE_FIELD  = {
	'insert' : 'INSERT INTO T_BASE_FIELD(ZDID,ZDMC,ZDLX,ZDCD,SFZJ,SFWK,MRZ,ZDZS,BID) VALUES (#ZDMC#,#ZDLX#,#ZDCD#,#SFZJ#,#SFWK#,#MRZ#,#ZDZS#,#BID#)',
	'delete' : 'DELETE FROM T_BASE_FIELD WHERE ZDID = #ZDID#',
	'update' : 'UPDATE  T_BASE_FIELD SET ZDMC = #ZDMC# WHERE ZDID = #ZDID#',
	'selectById' : 'SELECT A.ZDMC,A.ZDLX,A.ZDCD,A.SFZJ,A.SFWK,A.MRZ,A.ZDZS FROM T_BASE_FIELD A WHERE A.ZDID = #ZDID#',
	'selectAll' : 'SELECT A.ZDID,A.ZDMC,A.ZDLX,A.ZDCD,A.SFZJ,A.SFWK,A.MRZ,A.ZDZS FROM T_BASE_FIELD A '
}

module.exports = T_BASE_FIELD;