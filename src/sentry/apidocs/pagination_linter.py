import ast


class FindPaginateInGetMethodVisitor(ast.NodeVisitor):
    RETURN_TYPE = "PaginatedResponse"

    def __init__(self, class_name):
        self.class_name = class_name
        self.has_paginated_response = False  # Flag to indicate if 'get' returns PaginatedResponse

    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        if node.name == self.class_name:
            self.generic_visit(node)

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        if node.name == "get" and node.returns is not None:
            # Check if the return annotation is 'PaginatedResponse'
            if isinstance(node.returns, ast.Name) and node.returns.id == self.RETURN_TYPE:
                self.has_paginated_response = True
            elif isinstance(node.returns, ast.Attribute):  # For module.class annotations
                if node.returns.attr == self.RETURN_TYPE:
                    self.has_paginated_response = True


def find_method_and_check_paginate(file_name: str, class_name: str) -> bool:
    with open(file_name) as file:
        file_content = file.read()

    tree = ast.parse(file_content)
    visitor = FindPaginateInGetMethodVisitor(class_name)
    visitor.visit(tree)

    return visitor.has_paginated_response
