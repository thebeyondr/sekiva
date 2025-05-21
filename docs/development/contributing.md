# Contributing to Sekiva

## Development Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests [COMING SOON]
5. Submit a pull request

## Code Style

### Rust

- Follow [Rust Style Guide](https://doc.rust-lang.org/1.0.0/style/style/naming/README.html)
- Use `rustfmt` for formatting
- Run `clippy` before committing

```bash
# Format code
cargo fmt

# Run linter
cargo clippy
```

### TypeScript/React

- Use Prettier for formatting
- Follow ESLint rules
- Use TypeScript strict mode

```bash
# Format code
bun run format

# Run linter
bun run lint
```

## Testing

### Smart Contracts

```bash
# Run all tests
cargo test

# Run specific test
cargo test test_name

# Run with logging
RUST_LOG=debug cargo test
```

### Frontend

```bash
# Run unit tests
bun test

# Run e2e tests
bun run test:e2e
```

## Pull Request Process

1. Update documentation
2. Add tests for new features
3. Ensure all tests pass
4. Update changelog
5. Request review

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

## Documentation

- Update relevant docs
- Add code comments
- Update README if needed
- Document API changes

## Security

- Report security issues privately
- Follow security best practices
- Review code for vulnerabilities
- Test thoroughly

## Questions?

- Open an issue
- Join our Discord
- Check existing documentation 