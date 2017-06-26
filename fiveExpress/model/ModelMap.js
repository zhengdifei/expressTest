ModelMap = {
	'T_BASE_FIELD.insert' : {'sql' : 'INSERT INTO T_BASE_FIELD(ZDMC,ZDLX) VALUES (#ZDMC#,#ZDLX#)',
		'before' : ['../interceptor/Before1FieldInsertInterceptor','../interceptor/Before2FieldInsertInterceptor'],
		'after' : ['../interceptor/After1FieldInsertInterceptor','../interceptor/After2FieldInsertInterceptor']},
	'T_BASE_FIELD.delete' : 'DELETE FROM T_BASE_FIELD WHERE ZDID = #ZDID#',
	'T_BASE_FIELD.update' : 'UPDATE  T_BASE_FIELD SET ZDMC = #ZDMC# WHERE ZDID = #ZDID#',
	'T_BASE_FIELD.selectById' : {'sql':'SELECT A.ZDMC,A.ZDLX,A.ZDCD,A.SFZJ,A.SFWK,A.MRZ,A.ZDZS FROM T_BASE_FIELD A WHERE A.ZDID = #ZDID#'},
	'T_BASE_FIELD.selectAll' : 'SELECT A.ZDID,A.ZDMC,A.ZDLX,A.ZDCD,A.SFZJ,A.SFWK,A.MRZ,A.ZDZS FROM T_BASE_FIELD A '
}

module.exports = ModelMap;