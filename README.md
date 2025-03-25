# React Security Router

React 安全路由器

# 框架说明

rsr 是 react security router 的简写，一个基于 react router 实现路由级别控制的安全框架。

功能简介：

- 认证与授权
- 权限检测
- 二次签证（签名：如要求再次输入密码等）
- 等等

# 版本兼容

注意：不兼容 react router 7 版本，在 v7 😒 版本上的 `useBlocker` 逻辑变更了，暂时不考虑兼容。

# 简单例子

``` tsx

export default withSecurityBlocker(Root, bundler => {
    return bundler
        .context(builder => {
            return builder
                // 可选层级权限
                // .hierarchy('superadmin>admin;admin>users;users>guest')
                .resource(rb => rb.patterns('/login', '/logout', '/denied', '/signature').anonymous().build())
                .resource(rb => rb.patterns('/sheet').permissions('admin').signatured().build())
                .resource(rb => rb.patterns('/*').authenticated().build())
                .build();
        })
        .manager(builder => {
            return builder
                .behave({
                    notAuthenticationPath: '/login',
                    notSignaturePath: '/signature',
                    accessDeniedPath: '/denied',
                })
                .build();
        })
        // .addons()
        .build()

});

```
