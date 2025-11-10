<?php
/**
 * Classe de Conexão com MySQL
 * Gerencia conexão e operações com banco de dados
 */

class Database {
    private $conn;
    private static $instance = null;

    /**
     * Construtor privado para Singleton
     */
    private function __construct() {
        $this->connect();
    }

    /**
     * Singleton - retorna instância única
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Conecta ao banco de dados MySQL
     */
    private function connect() {
        try {
            $dsn = sprintf(
                "mysql:host=%s;port=%s;dbname=%s;charset=%s",
                DB_HOST,
                DB_PORT,
                DB_NAME,
                DB_CHARSET
            );

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
            ];

            $this->conn = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            $this->handleError("Erro de conexão: " . $e->getMessage());
        }
    }

    /**
     * Retorna a conexão PDO
     */
    public function getConnection() {
        return $this->conn;
    }

    /**
     * Executa query SELECT
     */
    public function query($sql, $params = []) {
        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            $this->handleError("Erro ao executar query: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Executa query SELECT retornando uma única linha
     */
    public function queryOne($sql, $params = []) {
        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetch();
        } catch (PDOException $e) {
            $this->handleError("Erro ao executar query: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Executa INSERT, UPDATE, DELETE
     */
    public function execute($sql, $params = []) {
        try {
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute($params);
        } catch (PDOException $e) {
            $this->handleError("Erro ao executar comando: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Retorna ID do último insert
     */
    public function lastInsertId() {
        return $this->conn->lastInsertId();
    }

    /**
     * Inicia transação
     */
    public function beginTransaction() {
        return $this->conn->beginTransaction();
    }

    /**
     * Commit da transação
     */
    public function commit() {
        return $this->conn->commit();
    }

    /**
     * Rollback da transação
     */
    public function rollback() {
        return $this->conn->rollBack();
    }

    /**
     * Trata erros
     */
    private function handleError($message) {
        if (DEBUG_MODE) {
            error_log($message);
            throw new Exception($message);
        } else {
            error_log($message);
            throw new Exception("Erro no banco de dados");
        }
    }

    /**
     * Previne clonagem
     */
    private function __clone() {}

    /**
     * Previne deserialização
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}
