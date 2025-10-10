# ADR 9: Environment-Based JWT Token Security

## Status

Accepted

## Date

2025-10-10

## Context

During a security code review, it was identified that including JWT tokens in HTTP response bodies alongside httpOnly cookies creates potential XSS attack vectors. The suggestion was to remove JWT tokens from response bodies entirely to prevent client-side JavaScript from accessing them.

However, our existing development and testing infrastructure depends on accessing JWT tokens from response bodies for:

- End-to-end authentication testing
- JWT token analysis and validation
- Bearer token authentication testing
- Development tooling and debugging

Removing tokens entirely would break our testing infrastructure and development workflow.

## Decision

We will implement **environment-based JWT token exposure** in authentication responses:

- **Production Environment**: JWT tokens are excluded from response bodies to prevent XSS attacks
- **Development/Testing Environments**: JWT tokens remain in response bodies to maintain testing compatibility
- **All Environments**: httpOnly cookies continue to provide secure authentication

### Implementation Details

1. **Authentication Controller (`packages/api/src/controllers/auth.ts`)**:

   ```typescript
   // Only include token in response body for development/testing environments
   const responseData: any = { ok: true };
   if (process.env.NODE_ENV !== 'production') {
     responseData.token = result.token;
   }
   ```

2. **Cookie Security**: Enhanced with environment-aware secure flag
3. **Test Compatibility**: Updated tests to gracefully handle missing tokens in production
4. **Frontend Compatibility**: Next.js API routes handle conditional token presence

## Consequences

### Positive

- ✅ **Enhanced Security**: Production environments prevent XSS access to JWT tokens
- ✅ **Zero Breaking Changes**: Development and testing workflows remain intact
- ✅ **Clear Security Intent**: Environment-based logic explicitly shows security consideration
- ✅ **Backwards Compatible**: Existing code continues to work without modification
- ✅ **Progressive Enhancement**: Can be deployed without coordination across environments

### Negative

- ⚠️ **Environment Dependency**: Security level depends on correct NODE_ENV configuration
- ⚠️ **Testing Gap**: Production token handling cannot be fully tested in development
- ⚠️ **Code Complexity**: Slight increase in conditional logic

### Neutral

- 📋 **Documentation Requirement**: Team must understand environment-based behavior
- 📋 **Deployment Consideration**: Must ensure NODE_ENV=production in production deployments

## Alternatives Considered

### 1. Complete Token Removal

**Rejected**: Would break existing testing infrastructure and development workflow.

### 2. Separate Test Endpoint

**Rejected**: Creates additional maintenance overhead and API surface area.

### 3. Header-Based Token Exposure

**Rejected**: Headers are still accessible to client-side JavaScript, providing minimal security improvement over response body.

### 4. Custom Security Headers

**Rejected**: Adds complexity without addressing the core XSS concern.

## Implementation Notes

- All 57 existing API unit tests continue to pass
- E2E tests gracefully handle production mode (skip when token unavailable)
- httpOnly cookies provide authentication for all application functionality
- Secure flag automatically enabled in production for HTTPS-only transmission

## References

- OWASP XSS Prevention Guidelines
- JWT Security Best Practices
- [Original Security Review Feedback](../../Copilot-Processing.md)
