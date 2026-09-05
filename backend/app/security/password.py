"""
Password hashing -- bcrypt, used directly (not through passlib).

Discovered during verification, not theoretical: passlib's bcrypt backend
does a version-sniff against `bcrypt.__about__.__version__`, an attribute
recent `bcrypt` package releases (4.1+) removed -- passlib 1.7.4 raises
`AttributeError: module 'bcrypt' has no attribute '__about__'` immediately
on the first hash() call. This is a real, currently-live compatibility gap
between the two libraries, not a hypothetical. Using `bcrypt` directly
sidesteps it entirely and is one less dependency in the chain. See the
Common Bugs & Fixes entry for the passlib version instead, if you'd rather
pin around it.

Never store, log, or compare plain passwords anywhere else in the
codebase -- every password touches only these two functions.
"""
import bcrypt

_ENCODING = "utf-8"


def hash_password(plain_password: str) -> str:
    hashed = bcrypt.hashpw(plain_password.encode(_ENCODING), bcrypt.gensalt())
    return hashed.decode(_ENCODING)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(_ENCODING), password_hash.encode(_ENCODING))
