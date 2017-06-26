/**
 * function : 数据操作集合
 * author : 郑涤非
 * time : 2016-2-25
 * version : 1.0
 */
ModelMap = {
	'T_BASE_FIELD.insert' : {'sql' : 'INSERT INTO T_BASE_FIELD(ZDMC,ZDLX) VALUES (#ZDMC#,#ZDLX#)',
		'before' : ['../interceptor/Before1FieldInsertInterceptor','../interceptor/Before2FieldInsertInterceptor'],
		'after' : ['../interceptor/After1FieldInsertInterceptor','../interceptor/After2FieldInsertInterceptor']},
	'T_BASE_FIELD.delete' : {'sql':'DELETE FROM T_BASE_FIELD WHERE ZDID = #ZDID#',
		'before' : ['../interceptor/Before3FieldInsertInterceptor']},
	'T_BASE_FIELD.update' : 'UPDATE  T_BASE_FIELD SET ZDMC = #ZDMC# WHERE ZDID = #ZDID#',
	'T_BASE_FIELD.selectById' : {'sql':'SELECT A.ZDMC,A.ZDLX,A.ZDCD,A.SFZJ,A.SFWK,A.MRZ,A.ZDZS FROM T_BASE_FIELD A WHERE A.ZDID = #ZDID#'},
	'T_BASE_FIELD.selectAll' : 'SELECT A.ZDID,A.ZDMC,A.ZDLX,A.ZDCD,A.SFZJ,A.SFWK,A.MRZ,A.ZDZS FROM T_BASE_FIELD A '
}

module.exports = ModelMap;