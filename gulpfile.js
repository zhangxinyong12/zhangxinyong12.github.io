const gulp = require('gulp');

gulp.task('default', function () {
    return gulp.src('docs/.vuepress/dist/**/*').pipe((gulp.dest('../zhangxinyong12.github.io')))
});