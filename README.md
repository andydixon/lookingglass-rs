# LookingGlass

A Rust implementation of LookingGlass

```
Usage: lookingglass [OPTIONS] [COMMAND] [ARGS]...

Arguments:
  [COMMAND]  The command to execute [default: /bin/login]
  [ARGS]...  Arguments for the command

Options:
  -v, --verbose...       Print more messages
  -q, --quiet...         Print less messages
  -l, --listen <LISTEN>  The address to bind to [default: localhost:8080]
  -h, --help             Print help
```

## Customizing login behaviour

### No login required
You can have the lookingglass server spawn a shell without requiring the user to login.
Simply adjust the command line arguments:
```
lookingglass -- /usr/bin/zsh -l
```

### Require password of a specific user
You can also have the lookingglass server start `su -l MYUSER`.
The `su` program will ask for a password before starting a login shell for `MYUSER`.
```
lookingglass -- /usr/bin/su -l MYUSER
```

### Password login for any user
You could try to use the `/sbin/login` program.
However, the `login` program requires root permissions to function on many systems.

You can mimic the behaviour of `login` with a small shell script:
```sh
#!/bin/sh
read -p "Username: " -r username
exec su -l "$username"
```